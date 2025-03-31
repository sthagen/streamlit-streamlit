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

import { MockInstance } from "vitest"

import { buildHttpUri, isHttps, isLocalhost, makePath } from "."

describe("uri", () => {
  let originalLocation: Location
  let windowSpy: MockInstance

  beforeEach(() => {
    originalLocation = window.location
    windowSpy = vi.spyOn(window, "location", "get")
  })

  afterEach(() => {
    windowSpy.mockRestore()
  })

  describe("buildHttpUri", () => {
    it("builds HTTP URI correctly", () => {
      windowSpy.mockReturnValue({
        ...originalLocation,
        href: "http://something",
      })
      const uri = buildHttpUri(
        {
          hostname: "the_host",
          port: "9988",
          pathname: "foo/bar",
        } as URL,
        "baz"
      )
      expect(uri).toBe("http://the_host:9988/foo/bar/baz")
    })

    it("builds HTTPS URI correctly", () => {
      windowSpy.mockReturnValue({
        ...originalLocation,
        href: "https://something",
      })
      const uri = buildHttpUri(
        {
          hostname: "the_host",
          port: "9988",
          pathname: "foo/bar",
        } as URL,
        "baz"
      )
      expect(uri).toBe("https://the_host:9988/foo/bar/baz")
    })

    it("builds HTTP URI with no base path", () => {
      windowSpy.mockReturnValue({
        ...originalLocation,
        href: "http://something",
      })
      const uri = buildHttpUri(
        {
          hostname: "the_host",
          port: "9988",
          pathname: "",
        } as URL,
        "baz"
      )
      expect(uri).toBe("http://the_host:9988/baz")
    })
  })

  describe("makePath", () => {
    it("makes path correctly", () => {
      const path = makePath("foo/bar", "baz")
      expect(path).toBe("foo/bar/baz")
    })

    it("makes path with no base path", () => {
      const path = makePath("", "baz")
      expect(path).toBe("baz")
    })
  })

  describe("isHttps", () => {
    it("returns true for HTTPS", () => {
      windowSpy.mockReturnValue({
        ...originalLocation,
        href: "https://something",
      })
      expect(isHttps()).toBe(true)
    })

    it("returns false for HTTP", () => {
      windowSpy.mockReturnValue({
        ...originalLocation,
        href: "http://something",
      })
      expect(isHttps()).toBe(false)
    })
  })

  describe("isLocalhost", () => {
    it("returns true given localhost", () => {
      windowSpy.mockReturnValue({ ...originalLocation, hostname: "localhost" })
      expect(isLocalhost()).toBe(true)
    })

    it("returns true given 127.0.0.1", () => {
      windowSpy.mockReturnValue({ ...originalLocation, hostname: "127.0.0.1" })
      expect(isLocalhost()).toBe(true)
    })

    it("returns false given other", () => {
      windowSpy.mockReturnValue({ ...originalLocation, hostname: "190.1.1.1" })
      expect(isLocalhost()).toBe(false)
    })

    it("returns false given null", () => {
      windowSpy.mockReturnValue({ ...originalLocation, hostname: null })
      expect(isLocalhost()).toBe(false)
    })

    it("returns false given undefined", () => {
      windowSpy.mockReturnValue({ ...originalLocation, hostname: undefined })
      expect(isLocalhost()).toBe(false)
    })
  })
})
