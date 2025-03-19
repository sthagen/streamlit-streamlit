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

import {
  emotionLightTheme,
  mockEndpoints,
  render,
  ThemeConfig,
} from "@streamlit/lib"
import { CustomThemeConfig } from "@streamlit/protobuf"

import { SidebarProps } from "./Sidebar"
import ThemedSidebar, { createSidebarTheme } from "./ThemedSidebar"

function getProps(
  props: Partial<SidebarProps> = {}
): Omit<SidebarProps, "chevronDownshift"> {
  return {
    endpoints: mockEndpoints(),
    appPages: [],
    navSections: [],
    onPageChange: vi.fn(),
    currentPageScriptHash: "page_hash",
    hasElements: true,
    hideSidebarNav: false,
    appLogo: null,
    expandSidebarNav: false,
    ...props,
  }
}

describe("ThemedSidebar Component", () => {
  it("should render without crashing", () => {
    render(<ThemedSidebar {...getProps()} />)

    expect(screen.getByTestId("stSidebar")).toBeInTheDocument()
  })

  it("should switch bgColor and secondaryBgColor", () => {
    render(<ThemedSidebar {...getProps()} />)

    expect(screen.getByTestId("stSidebar")).toHaveStyle({
      backgroundColor: emotionLightTheme.colors.secondaryBg,
    })
  })

  it("plumbs appPages to main Sidebar component", () => {
    const appPages = [
      {
        pageName: "streamlit app",
        scriptPath: "streamlit_app.py",
        urlPathname: "streamlit_app",
      },
      {
        pageName: "other app page",
        scriptPath: "other_app_page.py",
        urlPathname: "other_app_page",
      },
    ]
    render(<ThemedSidebar {...getProps({ appPages })} />)

    // Check Sidebar & SidebarNav render
    expect(screen.getByTestId("stSidebar")).toBeInTheDocument()
    expect(screen.getByTestId("stSidebarNav")).toBeInTheDocument()

    // Check the app pages passed
    expect(screen.getByText("streamlit app")).toBeInTheDocument()
    expect(screen.getByText("other app page")).toBeInTheDocument()
  })
})

describe("createSidebarTheme", () => {
  const createMockTheme = (overrides: any = {}): ThemeConfig => ({
    name: "mockTheme",
    basewebTheme: {},
    primitives: {},
    themeInput: {},
    emotion: {
      colors: {
        secondaryBg: "#FFFFFF",
        bgColor: "#F0F0F0",
      },
    },
    ...overrides,
  })

  it("creates a light theme when background is light", () => {
    const theme = createMockTheme()
    const sidebarTheme = createSidebarTheme(theme)
    expect(sidebarTheme.themeInput?.base).toBe(
      CustomThemeConfig.BaseTheme.LIGHT
    )
  })

  it("creates a dark theme when background is dark", () => {
    const theme = createMockTheme({
      emotion: {
        colors: {
          secondaryBg: "#000000",
          bgColor: "#1A1A1A",
        },
      },
    })
    const sidebarTheme = createSidebarTheme(theme)
    expect(sidebarTheme.themeInput?.base).toBe(
      CustomThemeConfig.BaseTheme.DARK
    )
  })

  it("uses sidebar-specific background color when provided", () => {
    const theme = createMockTheme({
      themeInput: {
        sidebar: {
          backgroundColor: "#FF0000",
        },
      },
    })
    const sidebarTheme = createSidebarTheme(theme)
    expect(sidebarTheme.themeInput?.backgroundColor).toBe("#FF0000")
  })

  it("uses secondary background color as fallback when no sidebar background specified", () => {
    const theme = createMockTheme({
      emotion: {
        colors: {
          secondaryBg: "#CCCCCC",
          bgColor: "#F0F0F0",
        },
      },
    })
    const sidebarTheme = createSidebarTheme(theme)
    expect(sidebarTheme.themeInput?.backgroundColor).toBe("#CCCCCC")
  })

  it("uses secondary background color as fallback when sidebar background is empty string", () => {
    const theme = createMockTheme({
      themeInput: {
        sidebar: {
          backgroundColor: "",
        },
      },
      emotion: {
        colors: {
          secondaryBg: "#CCCCCC",
          bgColor: "#F0F0F0",
        },
      },
    })
    const sidebarTheme = createSidebarTheme(theme)
    expect(sidebarTheme.themeInput?.backgroundColor).toBe("#CCCCCC")
  })

  it("applies sidebar-specific overrides", () => {
    const theme = createMockTheme({
      themeInput: {
        sidebar: {
          primaryColor: "#FF0000",
          backgroundColor: "#00FF00",
        },
      },
    })
    const sidebarTheme = createSidebarTheme(theme)
    expect(sidebarTheme.themeInput?.primaryColor).toBe("#FF0000")
    expect(sidebarTheme.themeInput?.backgroundColor).toBe("#00FF00")
  })
})
