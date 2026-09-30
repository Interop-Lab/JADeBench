const React = require("react");
const Link = require("next/link");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(/Mobi|Android|BlackBerry|iPhone/i.test(userAgent));
  }, []);

  return { isMobile };
}

function Nav({
  selectedSectionSlugs,
  setShowModal,
  getTemplate,
  onMenuClick,
  isDrawerOpen,
  focusedSectionSlug,
}) {
  const content = selectedSectionSlugs.reduce((result, slug, index) => {
    const template = getTemplate(index);
    return template ? result + template.content : result;
  }, "");
  const { isMobile } = useDeviceDetect();

  const download = () => {
    const link = document.createElement("a");
    const blob = new Blob([content]);
    link.href = URL.createObjectURL(blob);
    link.download = "menu";
    link.click();

    if (isMobile === isDrawerOpen) {
      onMenuClick();
    }
    setShowModal(true);
  };

  return React.createElement(
    "header",
    { className: "nav" },
    React.createElement(
      Link,
      { href: "/", className: "nav__logo" },
      React.createElement("img", {
        className: "nav__logo-image",
        src: "/logo.svg",
        alt: "Logo",
      }),
    ),
    React.createElement(
      "nav",
      { className: "nav__controls" },
      React.createElement(
        "button",
        {
          className: "nav__menu-button",
          "aria-label": isDrawerOpen ? "Close menu" : "Open menu",
          onClick: onMenuClick,
        },
        React.createElement(isDrawerOpen ? Close : Menu, {
          className: "nav__menu-icon",
        }),
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "aria-label": "Download",
          className: "nav__download-button",
          onClick: download,
        },
        React.createElement("img", {
          className: "nav__download-icon",
          src: "/download.svg",
          alt: "Download",
        }),
        React.createElement("span", { className: "nav__download-label" }, "Download"),
      ),
    ),
  );
}

function Menu({ className }) {
  return React.createElement(
    "svg",
    { className, viewBox: "0 0 24 24" },
    React.createElement("path", {
      d: "M3 6h18M3 12h18M3 18h18",
    }),
  );
}

function Close({ className }) {
  return React.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24" },
    React.createElement("path", { d: "M6 6l12 12M18 6L6 18" }),
  );
}

module.exports = { Nav };
