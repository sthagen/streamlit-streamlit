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

import React from "react"

import { screen } from "@testing-library/react"

import { render } from "@streamlit/lib"

import Header, { HeaderProps } from "./Header"

const getProps = (propOverrides: Partial<HeaderProps> = {}): HeaderProps => ({
  showToolbar: true,
  showColoredLine: true,
  children: <div>Test</div>,
  ...propOverrides,
})

describe("Header", () => {
  it("renders a Header without crashing", () => {
    render(<Header {...getProps()} />)

    expect(screen.getByTestId("stHeader")).toBeInTheDocument()
  })

  it("renders correctly when showToolbar & showColoredLine both true", () => {
    render(<Header {...getProps()} />)

    expect(screen.getByTestId("stHeader")).toHaveStyle("display: block")
    expect(screen.getByTestId("stDecoration")).toBeVisible()
    expect(screen.getByTestId("stToolbar")).toBeVisible()
  })

  it("renders correctly when showToolbar & showColoredLine both false", () => {
    render(
      <Header {...getProps({ showToolbar: false, showColoredLine: false })} />
    )

    expect(screen.getByTestId("stHeader")).toHaveStyle("display: block")
    expect(screen.queryByTestId("stDecoration")).toBeNull()
    expect(screen.queryByTestId("stToolbar")).toBeNull()
  })

  it("renders correctly when showToolbar false & showColoredLine true", () => {
    render(
      <Header {...getProps({ showToolbar: false, showColoredLine: true })} />
    )

    expect(screen.getByTestId("stHeader")).toHaveStyle("display: block")
    expect(screen.getByTestId("stDecoration")).toBeVisible()
    expect(screen.queryByTestId("stToolbar")).toBeNull()
  })

  it("renders correctly when showToolbar true & showColoredLine false", () => {
    render(
      <Header {...getProps({ showToolbar: true, showColoredLine: false })} />
    )

    expect(screen.getByTestId("stHeader")).toHaveStyle("display: block")
    expect(screen.queryByTestId("stDecoration")).toBeNull()
    expect(screen.getByTestId("stToolbar")).toBeVisible()
  })
})
