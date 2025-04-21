/**
 * Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from "vitest"
import { renderHook } from "@testing-library/react"

import { useLayoutStyles } from "./useLayoutStyles"

describe("#useLayoutStyles", () => {
  describe("with an element", () => {
    describe("that has useContainerWidth set to a falsy value", () => {
      const useContainerWidth = false

      it.each([
        [undefined, { width: "auto" }],
        [0, { width: "auto" }],
        [-100, { width: "auto" }],
        [NaN, { width: "auto" }],
        [100, { width: 100 }],
      ])("and with a width value of %s, returns %o", (width, expected) => {
        const element = { width, useContainerWidth }
        const { result } = renderHook(() => useLayoutStyles({ element }))
        expect(result.current).toEqual(expected)
      })
    })

    describe('that has useContainerWidth set to "true"', () => {
      const useContainerWidth = true

      it.each([
        [undefined, { width: "100%" }],
        [0, { width: "100%" }],
        [-100, { width: "100%" }],
        [NaN, { width: "100%" }],
        [100, { width: "100%" }],
      ])("and with a width value of %s, returns %o", (width, expected) => {
        const element = { width, useContainerWidth }
        const { result } = renderHook(() => useLayoutStyles({ element }))
        expect(result.current).toEqual(expected)
      })
    })

    describe("that is an image list", () => {
      const useContainerWidth = false

      it.each([
        [undefined, { width: "100%" }],
        [0, { width: "100%" }],
        [-100, { width: "100%" }],
        [NaN, { width: "100%" }],
        [100, { width: "100%" }],
      ])("and with a width value of %s, returns %o", (width, expected) => {
        const element = { width, useContainerWidth, imgs: [] }
        const { result } = renderHook(() => useLayoutStyles({ element }))
        expect(result.current).toEqual(expected)
      })
    })
  })
})
