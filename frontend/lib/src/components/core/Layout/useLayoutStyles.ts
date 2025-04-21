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

import { useMemo } from "react"

export type UseLayoutStylesArgs<T> = {
  element:
    | (T & { width?: number; useContainerWidth?: boolean | null })
    | undefined
}

const isNonZeroPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && value > 0 && !isNaN(value)

export type UseLayoutStylesShape = {
  width: React.CSSProperties["width"]
}

/**
 * Returns the contextually-aware style values for an element container
 */
export const useLayoutStyles = <T>({
  element,
}: UseLayoutStylesArgs<T>): UseLayoutStylesShape => {
  /**
   * The width set from the `st.<command>`
   */
  const commandWidth = element?.width
  const useContainerWidth = element?.useContainerWidth

  // Note: Consider rounding the width to the nearest pixel so we don't have
  // subpixel widths, which leads to blurriness on screen

  const layoutStyles = useMemo((): UseLayoutStylesShape => {
    // The st.image element is potentially a list of images, so we always want
    // the enclosing container to be full width. The size of individual
    // images is managed in the ImageList component.
    const isImgList = element && "imgs" in element

    if (useContainerWidth || isImgList) {
      return {
        width: "100%",
      }
    } else if (isNonZeroPositiveNumber(commandWidth)) {
      return {
        width: commandWidth,
      }
    }
    return {
      width: "auto",
    }
  }, [useContainerWidth, commandWidth, element])

  return layoutStyles
}
