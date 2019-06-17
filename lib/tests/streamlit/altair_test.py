# Copyright 2019 Streamlit Inc. All rights reserved.

"""st.altair_chart unit test."""

import altair as alt
import json
import pandas as pd

from tests import testutil
import streamlit as st


df1 = pd.DataFrame(
    [['A', 'B', 'C', 'D'], [28, 55, 43, 91]],
    index=['a', 'b']
).T

c1 = alt.Chart(df1).mark_bar().encode(x='a', y='b')


class AltairTest(testutil.DeltaGeneratorTestCase):
    """Test ability to marshall altair_chart proto."""

    def test_altair_chart(self):
        """Test that it can be called with no args."""
        st.altair_chart(c1)

        c = self.get_delta_from_queue().new_element.vega_lite_chart
        self.assertEqual(c.HasField('data'), False)
        self.assertEqual(len(c.datasets), 1)

        spec_dict = json.loads(c.spec)
        self.assertEqual(spec_dict['encoding'], {
            'y': {'field': 'b', 'type': 'quantitative'},
            'x': {'field': 'a', 'type': 'nominal'},
        })
        self.assertEqual(spec_dict['data'], {
            'name': c.datasets[0].name,
        })
        self.assertEqual(spec_dict['mark'], 'bar')
        self.assertTrue('config' in spec_dict)
        self.assertTrue('encoding' in spec_dict)
