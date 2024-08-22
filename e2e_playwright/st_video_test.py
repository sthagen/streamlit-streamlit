# Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2024)
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
import re

import pytest
from playwright.sync_api import Page, expect

from e2e_playwright.conftest import ImageCompareFunction, wait_until
from e2e_playwright.shared.app_utils import (
    check_top_level_class,
    click_button,
    click_checkbox,
)

VIDEO_ELEMENTS_COUNT = 11


# Chromium miss codecs required to play that mp3 videos
# https://www.howtogeek.com/202825/what%E2%80%99s-the-difference-between-chromium-and-chrome/
@pytest.mark.skip_browser("chromium")
def test_video_rendering(app: Page, assert_snapshot: ImageCompareFunction):
    """Test that `st.video` renders correctly via screenshots matching."""
    video_elements = app.get_by_test_id("stVideo")
    expect(video_elements).to_have_count(VIDEO_ELEMENTS_COUNT)

    # Wait for the video to load
    app.wait_for_timeout(2000)

    expect(video_elements.nth(0)).to_be_visible()
    expect(video_elements.nth(1)).to_be_visible()
    expect(video_elements.nth(2)).to_be_visible()
    expect(video_elements.nth(3)).to_be_visible()

    assert_snapshot(video_elements.nth(0), name="video_element_first")
    assert_snapshot(video_elements.nth(1), name="video_element_second")
    assert_snapshot(
        video_elements.nth(2),
        name="video_element_third",
        image_threshold=0.09,
    )
    assert_snapshot(
        video_elements.nth(3),
        name="video_element_with_subtitles",
        image_threshold=0.09,
    )


@pytest.mark.skip_browser("webkit")
def test_video_rendering_webp(app: Page, assert_snapshot: ImageCompareFunction):
    """Test that `st.video` renders correctly webm video via screenshots matching."""
    video_elements = app.get_by_test_id("stVideo")
    expect(video_elements).to_have_count(VIDEO_ELEMENTS_COUNT)

    # Wait for the video to load
    app.wait_for_timeout(2000)

    expect(video_elements.nth(4)).to_be_visible()
    assert_snapshot(
        video_elements.nth(4),
        name="video_element_webm_with_subtitles",
        image_threshold=0.09,
    )


def test_displays_a_video_player(app: Page):
    video_element = app.get_by_test_id("stVideo").nth(0)
    expect(video_element).to_be_visible()
    # src here is a generated by streamlit url since we pass a file content
    expect(video_element).to_have_attribute("src", re.compile(r".*media.*.mp4"))


def test_video_handles_start_time(app: Page):
    video_element = app.get_by_test_id("stVideo").nth(1)
    expect(video_element).to_be_visible()
    # src here is an url we pass to st.video
    expect(video_element).to_have_attribute(
        "src", "https://www.w3schools.com/html/mov_bbb.mp4"
    )


@pytest.mark.skip_browser("chromium")
def test_handles_changes_in_start_time(
    app: Page, assert_snapshot: ImageCompareFunction
):
    app.wait_for_timeout(2000)

    # Change the start time of second video from 6 to 5
    app.get_by_test_id("stNumberInput").get_by_test_id("stNumberInputStepDown").click()
    # Wait for the video start time to update
    app.wait_for_timeout(2000)

    video_elements = app.get_by_test_id("stVideo")
    assert_snapshot(video_elements.nth(1), name="video-updated-start")


@pytest.mark.parametrize(
    "nth_element",
    [
        pytest.param(5, marks=pytest.mark.skip_browser("webkit")),
        pytest.param(6, marks=pytest.mark.skip_browser("chromium")),
    ],
)
def test_video_end_time(app: Page, nth_element: int):
    """Test that `st.video` with end_time works correctly."""
    video_elements = app.get_by_test_id("stVideo")
    expect(video_elements).to_have_count(VIDEO_ELEMENTS_COUNT)

    expect(video_elements.nth(nth_element)).to_be_visible()

    video_element = video_elements.nth(nth_element)
    video_element.scroll_into_view_if_needed()
    video_element.evaluate("el => el.play()")
    # Wait until video will reach end_time
    app.wait_for_timeout(3000)
    expect(video_element).to_have_js_property("paused", True)
    wait_until(app, lambda: int(video_element.evaluate("el => el.currentTime")) == 33)


@pytest.mark.parametrize(
    "nth_element",
    [
        pytest.param(7, marks=pytest.mark.skip_browser("webkit")),
        pytest.param(8, marks=pytest.mark.skip_browser("chromium")),
    ],
)
def test_video_end_time_loop(app: Page, nth_element: int):
    """Test that `st.video` with end_time and loop works correctly."""
    video_elements = app.get_by_test_id("stVideo")
    expect(video_elements).to_have_count(VIDEO_ELEMENTS_COUNT)

    expect(video_elements.nth(nth_element)).to_be_visible()

    video_element = video_elements.nth(nth_element)
    video_element.scroll_into_view_if_needed()
    video_element.evaluate("el => el.play()")
    # According to the element definition looks like this:
    # start_time=35, end_time=39, loop=True
    # We wait for 6 seconds, which mean the current time should be approximately 37:
    # 4 seconds until end_time and 2 seconds starting from start time
    app.wait_for_timeout(6000)
    expect(video_element).to_have_js_property("paused", False)
    wait_until(app, lambda: 36 < video_element.evaluate("el => el.currentTime") < 38)


def test_video_autoplay(app: Page):
    """Test that `st.video` autoplay property works correctly."""
    video_elements = app.get_by_test_id("stVideo")
    expect(video_elements).to_have_count(VIDEO_ELEMENTS_COUNT)

    expect(video_elements.nth(9)).to_be_visible()

    video_element = video_elements.nth(9)
    video_element.scroll_into_view_if_needed()
    expect(video_element).to_have_js_property("paused", True)
    expect(video_element).to_have_js_property("autoplay", False)

    click_checkbox(app, "Autoplay")

    # To prevent flakiness, we wait for the video to load and start playing
    wait_until(app, lambda: video_element.evaluate("el => el.readyState") == 4)
    expect(video_element).to_have_js_property("autoplay", True)
    expect(video_element).to_have_js_property("paused", False)


def test_video_muted_autoplay(app: Page):
    """Test that `st.video` muted and autoplay properties work correctly."""
    video_elements = app.get_by_test_id("stVideo")
    expect(video_elements).to_have_count(VIDEO_ELEMENTS_COUNT)

    expect(video_elements.nth(10)).to_be_visible()

    video_element = video_elements.nth(10)
    video_element.scroll_into_view_if_needed()

    # To prevent flakiness, we wait for the video to load and start playing
    wait_until(app, lambda: video_element.evaluate("el => el.readyState") == 4)
    expect(video_element).to_have_js_property("muted", True)
    expect(video_element).to_have_js_property("autoplay", True)
    expect(video_element).to_have_js_property("paused", False)


def test_video_remount_no_autoplay(app: Page):
    """Test that `st.video` remounts correctly without autoplay."""
    video_elements = app.get_by_test_id("stVideo")
    expect(video_elements).to_have_count(VIDEO_ELEMENTS_COUNT)

    expect(video_elements.nth(9)).to_be_visible()

    video_element = video_elements.nth(9)
    expect(video_element).to_have_js_property("paused", True)
    expect(video_element).to_have_js_property("autoplay", False)

    click_checkbox(app, "Autoplay")

    # To prevent flakiness, we wait for the video to load and start playing
    wait_until(app, lambda: video_element.evaluate("el => el.readyState") == 4)
    expect(video_element).to_have_js_property("autoplay", True)
    expect(video_element).to_have_js_property("paused", False)

    click_checkbox(app, "Autoplay")
    click_button(app, "Create some elements to unmount component")

    expect(video_element).to_have_js_property("autoplay", False)
    expect(video_element).to_have_js_property("paused", True)


def test_check_top_level_class(app: Page):
    """Check that the top level class is correctly set."""
    check_top_level_class(app, "stVideo")
