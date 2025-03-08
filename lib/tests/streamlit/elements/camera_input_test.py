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

"""camera_input unit test."""

from unittest.mock import patch

from parameterized import parameterized

import streamlit as st
from streamlit.errors import StreamlitAPIException
from streamlit.proto.Common_pb2 import FileURLs as FileURLsProto
from streamlit.proto.LabelVisibilityMessage_pb2 import LabelVisibilityMessage
from streamlit.runtime.uploaded_file_manager import UploadedFile, UploadedFileRec
from tests.delta_generator_test_case import DeltaGeneratorTestCase


class CameraInputTest(DeltaGeneratorTestCase):
    def test_just_label(self):
        """Test that it can be called with no other values."""
        st.camera_input("the label")

        c = self.get_delta_from_queue().new_element.camera_input
        self.assertEqual(c.label, "the label")
        self.assertEqual(
            c.label_visibility.value,
            LabelVisibilityMessage.LabelVisibilityOptions.VISIBLE,
        )

    def test_help_tooltip(self):
        """Test that it can be called with help parameter."""
        st.camera_input("the label", help="help_label")

        c = self.get_delta_from_queue().new_element.camera_input
        self.assertEqual(c.help, "help_label")

    @parameterized.expand(
        [
            ("visible", LabelVisibilityMessage.LabelVisibilityOptions.VISIBLE),
            ("hidden", LabelVisibilityMessage.LabelVisibilityOptions.HIDDEN),
            ("collapsed", LabelVisibilityMessage.LabelVisibilityOptions.COLLAPSED),
        ]
    )
    def test_label_visibility(self, label_visibility_value, proto_value):
        """Test that it can be called with label_visibility parameter."""
        st.camera_input("the label", label_visibility=label_visibility_value)

        c = self.get_delta_from_queue().new_element.camera_input
        self.assertEqual(c.label_visibility.value, proto_value)

    def test_label_visibility_wrong_value(self):
        with self.assertRaises(StreamlitAPIException) as e:
            st.camera_input("the label", label_visibility="wrong_value")
        self.assertEqual(
            str(e.exception),
            "Unsupported label_visibility option 'wrong_value'. Valid values are "
            "'visible', 'hidden' or 'collapsed'.",
        )

    def test_cached_widget_replay_warning(self):
        """Test that a warning is shown when this widget is used inside a cached function."""
        st.cache_data(lambda: st.camera_input("the label"))()

        # The widget itself is still created, so we need to go back one element more:
        el = self.get_delta_from_queue(-2).new_element.exception
        self.assertEqual(el.type, "CachedWidgetWarning")
        self.assertTrue(el.is_warning)

    @patch("streamlit.elements.widgets.camera_input._get_upload_files")
    def test_not_allowed_file_extension_raise_an_exception_for_camera_input(
        self, get_upload_files_patch
    ):
        rec1 = UploadedFileRec("file1", "file1.png", "type", b"123")

        uploaded_files = [
            UploadedFile(
                rec1, FileURLsProto(file_id="file1", delete_url="d1", upload_url="u1")
            ),
        ]

        get_upload_files_patch.return_value = uploaded_files
        with self.assertRaises(StreamlitAPIException) as e:
            return_val = st.camera_input("label")
            st.write(return_val)
        self.assertEqual(
            str(e.exception),
            "Invalid file extension: `.png`. Allowed: ['.jpg']",
        )
