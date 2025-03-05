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

import pytest
from playwright.sync_api import Page, expect

from e2e_playwright.conftest import rerun_app
from e2e_playwright.shared.app_utils import (
    click_button,
    click_toggle,
    fill_number_input,
)


def test_forward_msg_cache_receives_msg(app: Page):
    app.evaluate("window.streamlitDebug.clearForwardMsgCache()")
    rerun_app(app)
    expect(app.get_by_role("dialog")).not_to_be_visible()

    app.expect_request("**/_stcore/message/")


def _rerun_app(app: Page, times: int):
    for _ in range(times):
        click_button(app, "Re-run")


@pytest.mark.performance
@pytest.mark.repeat(2)  # only repeat 2 times since otherwise it would take too long
def test_simulate_large_data_usage_performance(app: Page):
    # Rerun app a couple of times:
    _rerun_app(app, 5)

    # Show dataframe:
    click_toggle(app, "Show dataframes")
    # Rerun app a couple of times:
    _rerun_app(app, 5)

    # # Set 50k rows:
    fill_number_input(app, "Number of rows", 50000)

    # Rerun app a couple of times:
    _rerun_app(app, 5)

    # Show more text messages:
    fill_number_input(app, "Number of small messages", 100)

    # Rerun app a couple of times:
    _rerun_app(app, 10)


@pytest.mark.performance
@pytest.mark.repeat(2)  # only repeat 2 times since otherwise it would take too long
def test_simulate_many_small_messages_performance(app: Page):
    # Show 150 unique texts with 50kb each:
    fill_number_input(app, "Number of small messages", 150)
    _rerun_app(app, 5)

    # Reduce the size of every message to 15KB:
    fill_number_input(app, "Message KB size", 15)
    _rerun_app(app, 10)
