var UX;
(function (UX) {
    var Helpers;
    (function (Helpers) {
        function getNamedElementMapOf(parent) {
            var namedElementMap = {};
            parent.find("[name]").each(function () {
                var name = $(this).attr("name");
                if (!namedElementMap[name]) {
                    namedElementMap[name] = parent.find("[name=" + name + "]");
                }
            });
            return namedElementMap;
        }
        Helpers.getNamedElementMapOf = getNamedElementMapOf;
        function getTemplateWithName(templateName) {
            return $("#templates .template-" + templateName).clone();
        }
        Helpers.getTemplateWithName = getTemplateWithName;
        function switchToMode(modeName) {
            Utility.Debugging.assert(/^mode(-\w+)+$/.test(modeName), "Invalid mode name: " + modeName);
            if (modeName === "mode-detail")
                return;
            $(".modes").hide();
            var nodes = modeName.split("-");
            var length = nodes.length;
            var queryString = ".modes.mode";
            for (var i = 1; i < length; ++i) {
                queryString += "-" + nodes[i];
                $(queryString).show();
            }
            $(window).resize();
        }
        Helpers.switchToMode = switchToMode;
        function occupiesLeftWidthOfParent(jqElement) {
            var action = (function () {
                if (jqElement.is(":hidden")) {
                    return;
                }
                var leftWidth = jqElement.parent().width();
                jqElement.siblings().not(":hidden").toArray().forEach(function (sibling) {
                    leftWidth -= $(sibling).outerWidth(true);
                });
                leftWidth -= jqElement.outerWidth(true) - jqElement.width();
                var minWidth = parseFloat(jqElement.css("min-width"));
                if (leftWidth < minWidth) {
                    leftWidth = minWidth;
                }
                var maxWidth = parseFloat(jqElement.css("max-width"));
                if (leftWidth > maxWidth) {
                    leftWidth = maxWidth;
                }
                jqElement.css("width", leftWidth + "px");
            });
            action();
            addWindowResizeCallback(action);
        }
        Helpers.occupiesLeftWidthOfParent = occupiesLeftWidthOfParent;
        function occupiesLeftHeightOfParent(jqElement) {
            var action = (function () {
                if (jqElement.is(":hidden")) {
                    return;
                }
                var leftHeight = jqElement.parent().height();
                jqElement.siblings().not(":hidden").toArray().forEach(function (sibling) {
                    leftHeight -= $(sibling).outerHeight(true);
                });
                leftHeight -= jqElement.outerHeight(true) - jqElement.height();
                var minHeight = parseFloat(jqElement.css("min-height"));
                if (leftHeight < minHeight) {
                    leftHeight = minHeight;
                }
                var maxHeight = parseFloat(jqElement.css("max-height"));
                if (leftHeight > maxHeight) {
                    leftHeight = maxHeight;
                }
                jqElement.css("height", leftHeight);
            });
            action();
            addWindowResizeCallback(action);
        }
        Helpers.occupiesLeftHeightOfParent = occupiesLeftHeightOfParent;
        function occupiesLeftHeightOfParentAsMaxHeight(jqElement) {
            var action = (function () {
                if (jqElement.is(":hidden")) {
                    return;
                }
                var maxHeightCssString = jqElement.parent().css("max-height");
                var maxHeight = 0;
                if (maxHeightCssString) {
                    maxHeight = parseFloat(maxHeightCssString);
                    maxHeight -= jqElement.parent().outerHeight() - jqElement.parent().height();
                }
                var leftHeight = maxHeight || jqElement.parent().height();
                jqElement.siblings().not(":hidden").toArray().forEach(function (sibling) {
                    leftHeight -= $(sibling).outerHeight(true);
                });
                leftHeight -= jqElement.outerHeight(true) - jqElement.height();
                var minHeight = parseFloat(jqElement.css("min-height"));
                if (leftHeight < minHeight) {
                    leftHeight = minHeight;
                }
                jqElement.css("max-height", leftHeight);
            });
            action();
            addWindowResizeCallback(action);
        }
        Helpers.occupiesLeftHeightOfParentAsMaxHeight = occupiesLeftHeightOfParentAsMaxHeight;
        function addWindowResizeCallback(callback) {
            windowResizedCallbacks.push(callback);
        }
        Helpers.addWindowResizeCallback = addWindowResizeCallback;
        function triggerWindowResizeCallbacks() {
            windowResizedCallbacks.forEach(function (callback) {
                callback();
            });
        }
        function checkIfWindowResized() {
            var currentWindowHeight = $(window).height();
            var currentWindowWidth = $(window).width();
            if (windowHeight !== currentWindowHeight || windowWidth !== currentWindowWidth) {
                windowHeight = currentWindowHeight;
                windowWidth = currentWindowWidth;
                triggerWindowResizeCallbacks();
            }
        }
        var windowResizedCallbacks = [];
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        $(window).resize(triggerWindowResizeCallbacks);
        window.setInterval(checkIfWindowResized, 500);
    })(Helpers = UX.Helpers || (UX.Helpers = {}));
})(UX || (UX = {}));
//# sourceMappingURL=UXHelpers.js.map