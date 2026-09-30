"use strict";

var React = require("react");
var LinkModule = require("next/link");
var Link = LinkModule && LinkModule.__esModule ? LinkModule.default : LinkModule.default || LinkModule;

function Menu(props) {
  return React.createElement(
    "svg",
    Object.assign(
      {
        viewBox: "0 0 24 24",
        width: 24,
        height: 24,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true
      },
      props
    ),
    React.createElement("line", { x1: 3, y1: 6, x2: 21, y2: 6 }),
    React.createElement("line", { x1: 3, y1: 12, x2: 21, y2: 12 }),
    React.createElement("line", { x1: 3, y1: 18, x2: 21, y2: 18 })
  );
}

function Close(props) {
  return React.createElement(
    "svg",
    Object.assign(
      {
        viewBox: "0 0 24 24",
        width: 24,
        height: 24,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true
      },
      props
    ),
    React.createElement("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
    React.createElement("line", { x1: 6, y1: 6, x2: 18, y2: 18 })
  );
}

function useDeviceDetect() {
  var state = React.useState(false);
  var isMobile = state[0];
  var setMobile = state[1];

  React.useEffect(function () {
    var userAgent =
      typeof window === "undefined" ||
      typeof window.navigator === "undefined"
        ? ""
        : navigator.userAgent;

    setMobile(
      Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      )
    );
  }, []);

  return { isMobile: isMobile };
}

function Nav(props) {
  props = props || {};

  var state = React.useState(false);
  var isOpen = state[0];
  var setIsOpen = state[1];
  var isMobile = useDeviceDetect().isMobile;

  var links =
    props.links ||
    props.navLinks || [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/projects", label: "Projects" },
      { href: "/contact", label: "Contact" }
    ];

  function toggleMenu() {
    setIsOpen(function (open) {
      return !open;
    });
  }

  function closeMenu() {
    setIsOpen(false);
  }

  return React.createElement(
    "nav",
    { className: props.className },
    React.createElement(
      "div",
      { className: "nav-container" },
      props.logo != null
        ? React.createElement(
            Link,
            { href: props.homeHref || "/" },
            props.logo
          )
        : null,
      isMobile
        ? React.createElement(
            "button",
            {
              type: "button",
              className: "nav-toggle",
              onClick: toggleMenu,
              "aria-label": isOpen ? "Close menu" : "Open menu",
              "aria-expanded": isOpen
            },
            isOpen ? React.createElement(Close, null) : React.createElement(Menu, null)
          )
        : null,
      React.createElement(
        "ul",
        {
          className:
            "nav-links" + (isMobile ? (isOpen ? " open" : " closed") : "")
        },
        links.map(function (item, index) {
          var href = item.href || item.path || "/";
          var label = item.label || item.name || item.title;

          return React.createElement(
            "li",
            { key: item.key || href || index },
            React.createElement(
              Link,
              { href: href, onClick: closeMenu },
              label
            )
          );
        })
      ),
      props.children
    )
  );
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "Nav", {
  enumerable: true,
  get: function () {
    return Nav;
  }
});
