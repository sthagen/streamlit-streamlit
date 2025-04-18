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
import { AppContextProps } from "@streamlit/app/src/components/AppContext"
import * as StreamlitContextProviderModule from "@streamlit/app/src/components/StreamlitContextProvider"

import SidebarNavLink, { SidebarNavLinkProps } from "./SidebarNavLink"

const getProps = (
  props: Partial<SidebarNavLinkProps> = {}
): SidebarNavLinkProps => ({
  isActive: false,
  pageUrl: "https://www.example.com",
  icon: "",
  onClick: vi.fn(),
  children: "Test",
  ...props,
})

function getContextOutput(context: Partial<AppContextProps>): AppContextProps {
  return {
    wideMode: false,
    initialSidebarState: 0,
    embedded: false,
    showPadding: false,
    disableScrolling: false,
    showToolbar: false,
    showColoredLine: false,
    pageLinkBaseUrl: "",
    sidebarChevronDownshift: 0,
    widgetsDisabled: false,
    gitInfo: null,
    appConfig: {},
    ...context,
  }
}

describe("SidebarNavLink", () => {
  beforeEach(() => {
    // Default mock implementation
    vi.spyOn(StreamlitContextProviderModule, "useAppContext").mockReturnValue(
      getContextOutput({})
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders without crashing", () => {
    render(<SidebarNavLink {...getProps()} />)

    const sidebarNavLink = screen.getByTestId("stSidebarNavLink")
    expect(sidebarNavLink).toHaveTextContent("Test")
    expect(sidebarNavLink).toHaveAttribute("href", "https://www.example.com")
  })

  it("has the correct href & text", () => {
    render(<SidebarNavLink {...getProps()} />)

    const sidebarNavLink = screen.getByTestId("stSidebarNavLink")
    expect(sidebarNavLink).toHaveAttribute("href", "https://www.example.com")
    expect(sidebarNavLink).toHaveTextContent("Test")
  })

  it("renders with material icon", () => {
    render(<SidebarNavLink {...getProps({ icon: ":material/page:" })} />)

    expect(screen.getByTestId("stSidebarNavLink")).toBeInTheDocument()

    const materialIcon = screen.getByTestId("stIconMaterial")
    expect(materialIcon).toHaveTextContent("page")
  })

  it("renders with emoji icon", () => {
    render(<SidebarNavLink {...getProps({ icon: "🚀" })} />)

    expect(screen.getByTestId("stSidebarNavLink")).toBeInTheDocument()

    const emojiIcon = screen.getByTestId("stIconEmoji")
    expect(emojiIcon).toHaveTextContent("🚀")
  })

  it("renders a non-active page properly", () => {
    render(<SidebarNavLink {...getProps()} />)

    const sidebarNavLink = screen.getByTestId("stSidebarNavLink")
    // The non-active page has a transparent background with normal font
    expect(sidebarNavLink).toHaveStyle("background-color: rgba(0, 0, 0, 0)")
    expect(sidebarNavLink).toHaveStyle("font-weight: 400")
    // The text color is 80% (light theme) / 75% (dark theme) of the bodyText color
    expect(screen.getByText("Test")).toHaveStyle(
      "color: rgba(49, 51, 63, 0.8)"
    )
  })

  it("renders an active page properly", () => {
    render(<SidebarNavLink {...getProps({ isActive: true })} />)

    const sidebarNavLink = screen.getByTestId("stSidebarNavLink")
    // The active page has a special background color with bold font
    expect(sidebarNavLink).toHaveStyle(
      "background-color: rgba(151, 166, 195, 0.25)"
    )
    expect(sidebarNavLink).toHaveStyle("font-weight: 600")
    // The text color is the bodyText color
    expect(screen.getByText("Test")).toHaveStyle("color:rgb(49, 51, 63)")
  })

  it("renders a disabled page properly", () => {
    // Update the mock to return a context with widgetsDisabled set to true
    vi.spyOn(StreamlitContextProviderModule, "useAppContext").mockReturnValue(
      getContextOutput({ widgetsDisabled: true })
    )

    render(<SidebarNavLink {...getProps()} />)

    expect(screen.getByTestId("stSidebarNavLinkContainer")).toHaveStyle(
      "cursor: not-allowed"
    )
    expect(screen.getByText("Test")).toHaveStyle(
      "color: rgba(49, 51, 63, 0.4)"
    )
  })
})
