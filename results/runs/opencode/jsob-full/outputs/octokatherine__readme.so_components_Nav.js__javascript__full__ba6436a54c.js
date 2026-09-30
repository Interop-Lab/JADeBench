"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "Nav", { enumerable: true, get: () => Nav });

const React = require("react");
const LinkModule = require("next/link");
const Link = LinkModule.default || LinkModule;

function MenuIcon({ className }) {
  return React.createElement(
    "svg",
    { className, viewBox: "0 0 512 512" },
    React.createElement("title", null, "Menu"),
    React.createElement("path", {
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeMiterlimit: "10",
      strokeWidth: "30",
      d: "M80 160h352M80 256h352M80 352h352",
    }),
  );
}

function CloseIcon({ className }) {
  return React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      className,
      viewBox: "0 0 512 512",
    },
    React.createElement("title", null, "Close"),
    React.createElement("path", {
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "32",
      d: "M368 368L144 144M368 144L144 368",
    }),
  );
}

function useDeviceDetect() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i)));
  }, []);

  return { isMobile };
}

function Nav({
  selectedSectionSlugs,
  setShowModal,
  getTemplate,
  onMenuClick,
  isDrawerOpen,
  focusedSectionSlug: _focusedSectionSlug,
}) {
  const markdown = selectedSectionSlugs.reduce((result, sectionSlug) => {
    const template = getTemplate(sectionSlug);
    return template ? result + template.markdown : result;
  }, "");
  const { isMobile } = useDeviceDetect();

  function downloadMarkdown() {
    const link = document.createElement("a");
    const file = new Blob([markdown]);
    link.href = URL.createObjectURL(file);
    link.download = "README.md";
    link.click();

    if (isMobile && isDrawerOpen) onMenuClick();
    setShowModal(true);
  }

  return React.createElement(
    "nav",
    { className: "flex justify-between p-4 bg-gray-800 align-center w-full" },
    React.createElement(
      Link,
      {
        href: "/",
        className:
          "focus:outline-none focus:ring-2 focus:ring-emerald-400 flex items-center",
      },
      React.createElement("img", {
        className: "w-auto h-12",
        src: "readme.svg",
        alt: "readme.so logo",
      }),
    ),
    React.createElement(
      "div",
      { className: "flex flex-row-reverse md:flex-row" },
      React.createElement(
        "button",
        {
          className:
            "focus:outline-none focus:ring-2 focus:ring-emerald-400",
          "aria-label": isDrawerOpen ? "Close menu" : "Open menu",
          onClick: onMenuClick,
        },
        isDrawerOpen
          ? React.createElement(CloseIcon, {
              className: "w-10 h-10 md:hidden fill-current text-emerald-500",
            })
          : React.createElement(MenuIcon, {
              className: "w-10 h-10 md:hidden fill-current text-emerald-500",
            }),
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "aria-label": "Download Markdown",
          className:
            "flex flex-row relative items-center mr-4 md:mr-0 px-4 py-2 text-sm font-bold tracking-wide text-white border border-transparent rounded-md shadow-sm bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500",
          onClick: downloadMarkdown,
        },
        React.createElement("img", {
          className: "w-auto h-6 cursor-pointer",
          src: "download.svg",
          alt: "Download",
        }),
        React.createElement(
          "span",
          { className: "hidden md:inline-block ml-2" },
          "Download",
        ),
      ),
    ),
  );
}
