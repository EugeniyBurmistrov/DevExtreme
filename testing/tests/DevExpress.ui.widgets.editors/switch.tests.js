"use strict";

var $ = require("jquery"),
    pointerMock = require("../../helpers/pointerMock.js"),
    keyboardMock = require("../../helpers/keyboardMock.js"),
    fx = require("animation/fx");

require("common.css!");
require("generic_light.css!");
require("ui/switch");

QUnit.testStart(function() {
    var markup =
        '<div id="qunit-fixture">\
            <div id="switch"></div>\
            <div id="switch2"></div>\
            <div id="widget"></div>\
            <div style="display:none" id="invisibleSwitch"></div>\
            <div id="widthRootStyle" style="width: 300px;"></div>\
        </div>';

    $("#qunit-fixture").html(markup);
});

var SWITCH_CLASS = "dx-switch",
    SWITCH_ON_VALUE_CLASS = SWITCH_CLASS + "-on-value",
    INNER_CLASS = "dx-switch-inner",
    HANDLE_CLASS = "dx-switch-handle",

    DISABLED_CLASS = "dx-state-disabled",

    INNER_SELECTOR = "." + INNER_CLASS,

    LABEL_ON_CLASS = "dx-switch-on",
    LABEL_OFF_CLASS = "dx-switch-off",
    LABEL_ON_SELECTOR = "." + LABEL_ON_CLASS,
    LABEL_OFF_SELECTOR = "." + LABEL_OFF_CLASS,

    MARGIN_RANGE = {
        left: "-24px",
        right: "0px"
    };

var UIState = function(element) {
    if(element.hasClass(SWITCH_CLASS)) {
        element = element.find(INNER_SELECTOR);
    }

    var marginLeft = element.css("marginLeft");
    if(marginLeft === MARGIN_RANGE.right) {
        return true;
    }
    if(marginLeft === MARGIN_RANGE.left) {
        return false;
    }
};

var UIStateWithRTL = function(element) {
    var marginDirection = (element.dxSwitch("instance").option("rtlEnabled")) ? "Right" : "Left";

    if(element.hasClass(SWITCH_CLASS)) {
        element = element.find(INNER_SELECTOR);
    }
    var margin = element.css("margin" + marginDirection);

    if(margin === MARGIN_RANGE.right) {
        return true;
    }
    if(margin === MARGIN_RANGE.left) {
        return false;
    }
};

QUnit.module("widget init", {
    beforeEach: function() {
        fx.off = true;
    },
    afterEach: function() {
        fx.off = false;
    }
});

QUnit.test("switch should have correct width by default", function(assert) {
    var $element = $("#switch").dxSwitch();

    assert.ok($element.outerWidth() > 0, "outer width of the element must be more than zero");
});

QUnit.test("onContentReady fired after the widget is fully ready", function(assert) {
    assert.expect(2);

    $("#switch").dxSwitch({
        value: true,
        onContentReady: function(e) {
            assert.ok($(e.element).hasClass(SWITCH_CLASS));
            assert.ok($(e.element).hasClass(SWITCH_ON_VALUE_CLASS));
        }
    });
});

QUnit.test("default labels", function(assert) {
    var element = $("#switch").dxSwitch();

    var inner = element.find(INNER_SELECTOR);

    var labelOnEl = inner.find(LABEL_ON_SELECTOR);
    assert.equal($.trim(labelOnEl.text()), "ON");

    var labelOffEl = inner.find(LABEL_OFF_SELECTOR);
    assert.equal($.trim(labelOffEl.text()), "OFF");
});

QUnit.test("onText/offText on init", function(assert) {
    var element = $("#switch").dxSwitch({
        onText: "customOn",
        offText: "customOff"
    });

    var inner = element.find(INNER_SELECTOR);

    var textOnEl = inner.find(LABEL_ON_SELECTOR);
    assert.equal($.trim(textOnEl.text()), "customOn");

    var textOffEl = inner.find(LABEL_OFF_SELECTOR);
    assert.equal($.trim(textOffEl.text()), "customOff");
});

QUnit.test("onText/offText options changing", function(assert) {
    var $element = $("#switch").dxSwitch({}),
        instance = $element.dxSwitch("instance");

    instance.option("onText", "1");
    assert.equal($element.find("." + LABEL_ON_CLASS).text(), "1");
    instance.option("onText", "11");
    assert.equal($element.find("." + LABEL_ON_CLASS).text(), "11");

    instance.option("offText", "0");
    assert.equal($element.find("." + LABEL_OFF_CLASS).text(), "0");
    instance.option("offText", "00");
    assert.equal($element.find("." + LABEL_OFF_CLASS).text(), "00");
});

QUnit.test("default ui state", function(assert) {
    var element = $("#switch").dxSwitch();

    var inner = element.find(INNER_SELECTOR);
    assert.ok(!UIState(inner));
});

QUnit.test("ui state with options", function(assert) {
    var element = $("#switch").dxSwitch({
        onText: "customOn",
        offText: "customOff",
        value: true
    });

    var inner = element.find(INNER_SELECTOR);
    assert.equal(UIState(inner), true);
});

QUnit.test("onValueChanged option", function(assert) {
    var count = 0;

    var $element = $("#switch").dxSwitch({
        value: true,
        onValueChanged: function() {
            count++;
        }
    });

    var instance = $element.dxSwitch("instance");

    instance.option("value", false);
    assert.equal(count, 1);

    instance.option("onValueChanged", function() {
        count += 2;
    });

    instance.option("value", true);
    assert.equal(count, 3);
});

QUnit.test("value option changing", function(assert) {
    var element = $("#switch").dxSwitch({
        onText: "customOn",
        offText: "customOff",
        value: false
    });

    var instance = element.dxSwitch("instance");
    instance.option("value", true);
    assert.ok(element.hasClass("dx-switch-on-value"));
});

QUnit.test("value option changing - using non bool value", function(assert) {
    var element = $("#switch").dxSwitch();

    var instance = element.dxSwitch("instance");

    instance.option("value", undefined);
    assert.equal(element.dxSwitch("option", "value"), false);

    instance.option("value", 123);
    assert.equal(element.dxSwitch("option", "value"), true);
});

QUnit.test("value option changing must invoke the 'onValueChanged' action", function(assert) {
    var switcher = $("#switch").dxSwitch({ onValueChanged: function() { assert.ok(true); } }).dxSwitch("instance");
    switcher.option("value", true);
});

QUnit.test("disabled option", function(assert) {
    var element = $("#switch").dxSwitch();

    var instance = element.dxSwitch("instance");

    instance.option("disabled", true);
    instance.option("value", true);

    element.trigger("dxclick");
    assert.equal(instance.option("value"), true, "value is not changed");
});

QUnit.test("disabled switch should have special class", function(assert) {
    var element = $("#switch2").dxSwitch({ disabled: true });

    assert.ok(element.hasClass(DISABLED_CLASS));
});

QUnit.module("invisible container", {
    beforeEach: function() {
        fx.off = true;
    },
    afterEach: function() {
        fx.off = false;
    }
});

QUnit.test("the position of handle for invisible and visible switch should be equal", function(assert) {
    var $visibleElement = $("#switch").dxSwitch(),
        $invisibleElement = $("#invisibleSwitch").dxSwitch();

    if($visibleElement.dxSwitch("option", "useOldRendering")) {
        assert.ok(true, "not supported");
        return;
    }

    $invisibleElement.css("display", "block");
    assert.equal($visibleElement.find("." + HANDLE_CLASS).position().left, $invisibleElement.find("." + HANDLE_CLASS).position().left);
});

QUnit.module("hidden input");

QUnit.test("input should be able to get the 'true' value", function(assert) {
    var $element = $("#switch").dxSwitch({
            value: true
        }),
        $input = $element.find("input");

    assert.equal($input.val(), "true", "the input value is 'true'");
});

QUnit.test("input should be able to get the 'false' value", function(assert) {
    var $element = $("#switch").dxSwitch({
            value: false
        }),
        $input = $element.find("input");

    assert.equal($input.val(), "false", "the input value is 'false'");
});

QUnit.test("the hidden input should change its value on widget value change", function(assert) {
    var $element = $("#switch").dxSwitch({
            value: true
        }),
        instance = $element.dxSwitch("instance"),
        $input = $element.find("input");

    instance.option("value", false);
    assert.equal($input.val(), "false", "input value has been changed");

    instance.option("value", true);
    assert.equal($input.val(), "true", "input value has been changed second time");
});

QUnit.module("the 'name' option");

QUnit.test("widget input should get the 'name' attribute with a correct value", function(assert) {
    var expectedName = "some_name",
        $element = $("#switch").dxSwitch({
            name: expectedName
        }),
        $input = $element.find("input");

    assert.equal($input.attr("name"), expectedName, "the input 'name' attribute has correct value");
});

QUnit.module("interaction", {
    beforeEach: function() {
        fx.off = true;

        this.element = $("#switch").dxSwitch({ value: true });
        this.mouse = pointerMock(this.element);
    },
    afterEach: function() {
        fx.off = false;
    }
});

QUnit.test("click switches state", function(assert) {
    this.element.trigger("dxclick");
    assert.equal(UIState(this.element), false);
    assert.equal(this.element.dxSwitch("option", "value"), false);

    this.element.trigger("dxclick");
    assert.equal(UIState(this.element), true);
    assert.equal(this.element.dxSwitch("option", "value"), true);
});

QUnit.test("swipe switches state", function(assert) {
    this.mouse.start().swipeStart().swipeEnd(-1);
    assert.equal(UIState(this.element), false);
    assert.equal(this.element.dxSwitch("option", "value"), false);

    this.mouse.start().swipeStart().swipeEnd(1);
    assert.equal(UIState(this.element), true);
    assert.equal(this.element.dxSwitch("option", "value"), true);
});

QUnit.test("swipe gesture is to fire onValueChanged", function(assert) {
    var counter = 0,
        $element = $("#switch").dxSwitch({
            value: true,
            "onValueChanged": function() { counter++; }
        }),
        mouse = pointerMock($element);

    mouse.start().swipeStart().swipeEnd(-1);
    assert.equal(counter, 1);

    mouse.start().swipeStart().swipeEnd(1);
    assert.equal(counter, 2);
});

QUnit.test("swipe doesn't turn off feedback during gesture", function(assert) {
    var activeStateClass = "dx-state-active";

    var clock = sinon.useFakeTimers();

    try {
        assert.equal(this.element.hasClass(activeStateClass), false, "feedback off before start");
        this.mouse.start().swipeStart();
        assert.equal(this.element.hasClass(activeStateClass), true, "feedback on gesture start");

        this.mouse.swipe(0.01);
        assert.equal(this.element.hasClass(activeStateClass), true, "feedback stays on after gesture start");

        this.mouse.swipe(0.2);
        assert.equal(this.element.hasClass(activeStateClass), true, "feedback stays on after gesture continue");

        this.mouse.swipeEnd(1);
        assert.equal(this.element.hasClass(activeStateClass), false, "feedback off after gesture end");
    } finally {
        clock.restore();
    }
});

QUnit.test("click during animation hasn't any effects", function(assert) {
    var originalFxOff = fx.off;
    fx.off = false;
    var clock = sinon.useFakeTimers();
    try {
        var element = this.element,
            instance = element.dxSwitch("instance"),
            originalRenderPosition = instance._renderPosition,
            prevState = Number.MAX_VALUE,
            stateMonotonicallyDecreases = true,
            d1 = $.Deferred(),
            d2 = $.Deferred();

        instance._renderPosition = function(state, swipeOffset) {
            originalRenderPosition.call(instance, state, swipeOffset);
            stateMonotonicallyDecreases = stateMonotonicallyDecreases && (state <= prevState);
            prevState = state;
        };

        instance._animationDuration = 12345;

        element.click();

        setTimeout(function() {
            d1.resolve();
        }, 100);

        clock.tick(100);

        $.when(d1).done(function() {
            element.click();
            setTimeout(function() {
                d2.resolve();
            }, 500);
        });

        clock.tick(500);

        $.when(d2).done(function() {
            assert.ok(stateMonotonicallyDecreases);
        });
    } finally {
        clock.restore();
        fx.off = originalFxOff;
    }
});

QUnit.test("widget should be active while handle is swiped", function(assert) {
    var $element = this.element,
        pointer = this.mouse,
        clock = sinon.useFakeTimers();

    try {
        pointer.start().down().swipeStart().up();
        clock.tick(400);

        assert.ok($element.hasClass("dx-state-active"), "widget is still active");
    } finally {
        clock.restore();
    }
});

QUnit.test("handle follow of mouse during swipe", function(assert) {
    var $element = this.element;
    var pointer = this.mouse;

    $element.dxSwitch("option", { value: false });

    var $container = $element.find(".dx-switch-container");
    var $handler = $element.find(".dx-switch-handle");
    var $innerWrapper = $element.find(".dx-switch-inner");
    var halfMargin = ($container.outerWidth(true) - $handler.outerWidth()) / 2;

    pointer.start().down().move(halfMargin, 0);
    assert.roughEqual(parseInt($innerWrapper.css("marginLeft")), -halfMargin, 1.01, "switch was swipe on half width");
});

QUnit.test("click on disabled switch has no effect", function(assert) {
    var element = this.element,
        instance = element.dxSwitch("instance");

    instance.option("value", false);
    instance.option("disabled", true);

    element.trigger("dxclick");
    assert.ok(!UIState(element));

    this.mouse.start().swipeStart().swipeEnd(-1);
    assert.ok(!UIState(element));
});


QUnit.module("RTL", {
    beforeEach: function() {
        fx.off = true;

        this.element = $("#switch").dxSwitch({ value: true, rtlEnabled: true });
        this.mouse = pointerMock(this.element);
    },
    afterEach: function() {
        fx.off = false;
    }
});

QUnit.test("click switches state", function(assert) {
    var $element = this.element,
        instance = this.element.dxSwitch("instance");

    $element.trigger("dxclick");
    assert.equal(instance.option("value"), false);

    $element.trigger("dxclick");
    assert.equal(UIStateWithRTL($element), true);
    assert.equal(instance.option("value"), true);
});

QUnit.test("swipe switches state", function(assert) {
    var $element = this.element,
        instance = this.element.dxSwitch("instance");

    this.mouse.start().swipeStart().swipeEnd(1);
    assert.equal(instance.option("value"), false);

    this.mouse.start().swipeStart().swipeEnd(-1);
    assert.equal(UIStateWithRTL($element), true);
    assert.equal(instance.option("value"), true);
});

QUnit.module("widget sizing render");

QUnit.test("constructor", function(assert) {
    var $element = $("#widget").dxSwitch({ width: 400 }),
        instance = $element.dxSwitch("instance");

    assert.strictEqual(instance.option("width"), 400);
    assert.strictEqual($element.outerWidth(), 400, "outer width of the element must be equal to custom width");
});

QUnit.test("change width", function(assert) {
    var $element = $("#widget").dxSwitch(),
        instance = $element.dxSwitch("instance"),
        customWidth = 400;

    instance.option("width", customWidth);

    assert.strictEqual($element.outerWidth(), customWidth, "outer width of the element must be equal to custom width");
});

QUnit.module("keyboard navigation", {
    beforeEach: function() {
        fx.off = true;
    },
    afterEach: function() {
        fx.off = false;
    }
});

QUnit.test("state changes on enter/space/right and left key press", function(assert) {
    assert.expect(5);

    var $element = $("#widget").dxSwitch({
            focusStateEnabled: true,
            value: false
        }),
        instance = $element.dxSwitch("instance"),
        keyboard = keyboardMock($element);

    $element.trigger("focusin");

    keyboard.keyDown("enter");
    assert.equal(instance.option("value"), true, "value has been change");

    keyboard.keyDown("space");
    assert.equal(instance.option("value"), false, "value has been change");

    keyboard.keyDown("right");
    assert.equal(instance.option("value"), true, "value has been change");

    keyboard.keyDown("right");
    assert.equal(instance.option("value"), true, "value has not been change");

    keyboard.keyDown("left");
    assert.equal(instance.option("value"), false, "value has been change");
});

QUnit.test("state changes on right and left key press correctly in rtl mode", function(assert) {
    assert.expect(2);

    var $element = $("#widget").dxSwitch({
            focusStateEnabled: true,
            value: false,
            rtlEnabled: true
        }),
        instance = $element.dxSwitch("instance"),
        keyboard = keyboardMock($element);

    $element.trigger("focusin");

    keyboard.keyDown("left");
    assert.equal(instance.option("value"), true, "value has not been change");

    keyboard.keyDown("right");
    assert.equal(instance.option("value"), false, "value has been change");
});

QUnit.module("aria accessibility");

QUnit.test("aria properties", function(assert) {
    var $element = $("#switch").dxSwitch({
            onText: 'on test',
            offText: 'off test',
            value: true
        }),
        instance = $element.dxSwitch("instance");

    assert.equal($element.attr("aria-label"), "on test", "aria 'on state' label is correct");
    assert.equal($element.attr("aria-pressed"), "true", "aria 'on state' pressed attribute is correct");

    instance.option("value", false);
    assert.equal($element.attr("aria-label"), "off test", "aria 'off state' label is correct");
    assert.equal($element.attr("aria-pressed"), "false", "aria 'off state' pressed attribute is correct");
});
