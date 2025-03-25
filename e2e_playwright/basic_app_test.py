# Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from typing import Final

import pytest
from playwright.sync_api import Page, Response, expect

from e2e_playwright.conftest import wait_for_app_loaded


def test_total_loaded_assets_size_under_threshold(page: Page, app_port: int):
    """Test that verifies the total size of loaded web assets is under a
    configured threshold.
    """

    # Define an acceptable threshold for total size of web assets loaded on the
    # frontend (in MB) for a basic app run. While its important to keep the total
    # size of web assets low, you can modify this threshold if it's really needed
    # to add some new features. But make sure that its justified and intended.
    TOTAL_ASSET_SIZE_THRESHOLD_MB: Final = 7.5

    total_size_bytes = 0

    def handle_response(response: Response):
        nonlocal total_size_bytes
        try:
            # First try content-length header
            content_length = response.headers.get("content-length")
            if content_length:
                total_size_bytes += int(content_length)
            else:
                # If that fails, read the body (expensive for large files)
                body = response.body()
                total_size_bytes += len(body)
        except Exception as ex:
            print(f"Error calculating size of web assets: {ex}")

    # Register the response handler
    page.on("response", handle_response)

    page.goto(f"http://localhost:{app_port}/")
    wait_for_app_loaded(page)
    # Wait until all dependent resources are loaded:
    page.wait_for_load_state()
    # Wait until Hello world is visible:
    expect(page.get_by_text("Hello world")).to_be_visible()
    # Additional wait for lazy-loaded resources to load:
    page.wait_for_timeout(1000)

    # Convert to MB and assert it's under threshold
    total_size_mb = total_size_bytes / (1024 * 1024)
    assert total_size_mb < TOTAL_ASSET_SIZE_THRESHOLD_MB, (
        f"Total web asset size loaded on the frontend ({total_size_mb:.2f}MB) for a "
        f"basic app exceeds {TOTAL_ASSET_SIZE_THRESHOLD_MB}MB limit. "
        "In case this is expected and justified, you can change the "
        "threshold in the test."
    )


@pytest.mark.performance
def test_basic_app_performance(app: Page):
    """Collect performance metrics for a basic app."""
    # Wait until all dependent resources are loaded:
    app.wait_for_load_state()
    expect(app.get_by_text("Hello world")).to_be_visible()
