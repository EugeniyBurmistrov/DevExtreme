"use strict";

var $ = require("jquery"),
    noop = require("core/utils/common").noop,
    Class = require("core/class"),
    DefaultAdapter = require("ui/validation/default_adapter"),
    ValidationEngine = require("ui/validation_engine");

require("ui/validator");

var Fixture = Class.inherit({
    createValidator: function(options, element) {
        this.$element = element || this.$element || $("<div/>");
        this.stubAdapter = sinon.createStubInstance(DefaultAdapter);
        var validator = this.$element.dxValidator($.extend({
            adapter: this.stubAdapter
        }, options)).dxValidator("instance");

        return validator;
    },

    teardown: function() {
        this.$element.remove();
        ValidationEngine.initGroups();
    }
});

QUnit.module("General", {
    beforeEach: function() {
        this.fixture = new Fixture();
    },
    afterEach: function() {
        this.fixture.teardown();
    }
});

QUnit.test("Validator exists", function(assert) {
    var validator = this.fixture.createValidator();
    assert.ok(validator, "Validator was created");
    assert.ok(validator.validate, "Validation function is accessible");
});

QUnit.test("ValidationEngine can validate valid value against provided rules", function(assert) {
    var validator = this.fixture.createValidator({
        validationRules: [{
            type: "required",
            message: "Please set validator's value"
        }]
    });

    this.fixture.stubAdapter.getValue.returns("hello");

    var result = validator.validate();

    assert.strictEqual(validator.option("isValid"), true, "Validator should be isValid");
    assert.strictEqual(result.isValid, true, "Validator should be isValid - result");
    assert.ok(!result.brokenRule, "There should not be brokenRule");
    assert.ok(this.fixture.stubAdapter.applyValidationResults.calledOnce, "Adapter method should be called");
});

QUnit.test("ValidationEngine can validate Invalid against provided rules", function(assert) {
    var errorMessage = "Please set validator's value",
        validator = this.fixture.createValidator({
            value: "",
            validationRules: [{
                type: "required",
                message: errorMessage
            }]
        });

    var result = validator.validate();

    assert.strictEqual(validator.option("isValid"), false, "Validator should be invalid");
    assert.strictEqual(result.isValid, false, "Validator should be invalid - result");
    assert.ok(result.brokenRule, "There should not be brokenRule");
    assert.equal(result.brokenRule.message, errorMessage, "Validation message should be passed from rules");

});

QUnit.test("Returned value should contain state, name, validation errors and validator reference", function(assert) {
    var validator = this.fixture.createValidator({
        name: "Login",
        validationRules: [{
            type: "required"
        }]
    });
    // act

    this.fixture.stubAdapter.getValue.returns("");
    var result = validator.validate();
    // assert
    assert.ok(result, "Result should be returned");
    assert.strictEqual(result.isValid, validator.option("isValid"), "isValid flag should be passed");
    assert.equal(result.name, "Login");
    assert.strictEqual(result.brokenRule.validator, validator, "Validator reference");

});

QUnit.test("Validator with set validation group", function(assert) {
    // arrange
    var validationGroup = {},
        validator = this.fixture.createValidator({
            validationRules: [{
                type: "required"
            }],
            validationGroup: validationGroup
        });

    // act
    this.fixture.stubAdapter.getValue.returns("");
    var result = ValidationEngine.validateGroup(validationGroup);

    // assert
    assert.ok(result, "Result should be returned");
    assert.strictEqual(result.isValid, validator.option("isValid"), "isValid flag should be passed");
    assert.ok(result.brokenRules[0], "Result should contain validation errors");
    assert.strictEqual(result.brokenRules[0].validator, validator, "Validator reference");
});


QUnit.test("Validator can be reset", function(assert) {
    // arrange
    var validator = this.fixture.createValidator({ validationRules: [{ type: "custom", validationCallback: function() { return false; } }] });
    validator.validate();
    // act
    validator.reset();
    // assert
    assert.strictEqual(validator.option("isValid"), true, "isValid - Validation should be restored in valid state");
    assert.ok(this.fixture.stubAdapter.reset.calledOnce, "Editor should be reset");
});

QUnit.test("Validator should be validated after validationRules changed", function(assert) {
    var validator = this.fixture.createValidator({ validationRules: [{ type: 'required', message: 'En' }] });
    validator.validate();

    var spy = sinon.spy(validator, "validate");

    validator.option("validationRules", [{ type: 'required', message: 'De' }]);
    assert.equal(spy.callCount, 1, "validation performed");
});

QUnit.test("Untouched validator should not be validated after validationRules changed", function(assert) {
    var validator = this.fixture.createValidator({
        validationRules: [{
            type: 'custom',
            validationCallback: function() { return true; },
            message: 'En'
        }]
    });

    var spy = sinon.spy(validator, "validate");

    validator.option("validationRules", [{
        type: 'custom',
        validationCallback: function() { return true; },
        message: 'De'
    }]);
    assert.equal(spy.callCount, 0, "validation performed");
});


QUnit.module("Validator specific tests", {
    beforeEach: function() {
        this.fixture = new Fixture();
    },
    afterEach: function() {
        this.fixture.teardown();
    }
});

QUnit.test("changed Value (correct -> incorrect through options) should be validated", function(assert) {
    var errorMessage = "Please set validator's value",
        validator = this.fixture.createValidator({
            validationRules: [{
                type: "required",
                message: "Please set validator's value"
            }]
        });

    this.fixture.stubAdapter.getValue.returns("hello");
    validator.validate();

    this.fixture.stubAdapter.getValue.returns("");
    var result = validator.validate();

    assert.strictEqual(validator.option("isValid"), false, "Validator should be isValid");
    assert.ok(result.brokenRule, "brokenRule should be passed as part of result");
    assert.equal(result.brokenRule.message, errorMessage, "Validation message should be passed from rules");
});


QUnit.test("changed Value (incorrect -> correct through options) should be validated", function(assert) {
    var validator = this.fixture.createValidator({
        value: "",
        validationRules: [{
            type: "required",
            message: "Please set validator's value"
        }]
    });


    this.fixture.stubAdapter.getValue.returns("");
    validator.validate();

    this.fixture.stubAdapter.getValue.returns("hello");
    var result = validator.validate();

    assert.strictEqual(result.isValid, true, "Validator should be isValid");
    assert.ok(!result.brokenRule, "brokenRule is null");
});

QUnit.test("Validator should be able to bypass validation", function(assert) {
    var validator = this.fixture.createValidator({
        value: "",
        validationRules: [{
            type: "required",
            message: "Please set validator's value"
        }]
    });


    this.fixture.stubAdapter.bypass.returns(true);
    var result = validator.validate();

    assert.strictEqual(result.isValid, true, "Validator should be able to bypass validation");
    assert.ok(!result.brokenRule, "brokenRule is null");
});


QUnit.module("Registration in groups", {
    beforeEach: function() {
        this.fixture = new Fixture();
    },
    afterEach: function() {
        this.fixture.teardown();
    }
});


QUnit.test("Widget should be registered in a group", function(assert) {
    // act
    var validator = this.fixture.createValidator();
    // assert
    assert.ok(ValidationEngine.getGroupConfig(), "Group should be registered with default name");
    assert.strictEqual(ValidationEngine.getGroupConfig().validators[0], validator, "Validator should be registered");

});

QUnit.test("Widget should be deregistered after disposing", function(assert) {
    var validator = this.fixture.createValidator();

    // act
    validator._dispose();
    // assert
    assert.strictEqual(ValidationEngine.getGroupConfig().validators.length, 0, "Validator reference should be removed from group");
});

// T453506
QUnit.test("Validator should be created in the root group if group was not found", function(assert) {
    var validator = this.fixture.createValidator({
        modelByElement: function() { return "ViewModel"; }
    });

    // act
    validator._dispose();
    // assert
    assert.strictEqual(ValidationEngine.groups.length, 1, "new group was not created");
});

QUnit.test("Widget should be able to reinit group registration", function(assert) {
    var validator = this.fixture.createValidator({ validationGroup: "123" });

    // act
    validator.option("validationGroup", "234");
    // assert
    assert.strictEqual(ValidationEngine.getGroupConfig("234").validators[0], validator, "Validator should be re-registered in second group");

    assert.strictEqual(ValidationEngine.getGroupConfig("123"), undefined, "Validator should be de-registered in first group");
});

QUnit.test("Widget should be able to reinit group registration", function(assert) {
    var validator = this.fixture.createValidator({ validationGroup: "123" });
    // act
    validator.option("validationGroup", undefined);
    // assert
    assert.strictEqual(ValidationEngine.getGroupConfig().validators[0], validator, "Validator should be registered");
});


QUnit.module("Events", {
    beforeEach: function() {
        this.fixture = new Fixture();
    },
    afterEach: function() {
        this.fixture.teardown();
    }
});

QUnit.test("Validated event should fire", function(assert) {
    var value = "",
        name = "Login",
        validationRules = [{ type: 'required' }],
        expectedFailedValidationRule = { type: 'required', isValid: false, message: "Login is required", validator: {}, value: value },
        handler = sinon.stub();


    var validator = this.fixture.createValidator({
        name: name,
        onValidated: handler,
        validationRules: validationRules
    });
    expectedFailedValidationRule.validator = validator;
    this.fixture.stubAdapter.getValue.returns(value);
    // act
    validator.validate();
    // assert
    assert.ok(handler.calledOnce, "Validated handler should be called");
    var params = handler.getCall(0).args[0];
    assert.ok(handler.calledOn(validator), "Correct context of action");
    assert.strictEqual(params.validator, validator, "Validator reference should be passed");
    assert.equal(params.value, value, "Correct value was passed");
    assert.equal(params.name, name, "Name of Validator should be passed");
    assert.strictEqual(params.isValid, false, "isValid was passed");
    assert.deepEqual(params.validationRules, validationRules, "Correct rules were passed");
    assert.deepEqual(params.brokenRule, expectedFailedValidationRule, "Failed rules were passed");
});

QUnit.test("Focused event should fire", function(assert) {
    var validator = this.fixture.createValidator({
    });

    // act
    validator.focus();

    // assert
    assert.ok(this.fixture.stubAdapter.focus.calledOnce, "Validated handler should be called");
    // assert.ok(handler.calledOn(validator), "Correct context of action");
});

QUnit.test("validator.reset should fire event (to work correctly with dxValidationSummary)", function(assert) {
    // arrange
    var handler = sinon.stub(),
        validationRules = [{ type: "custom", validationCallback: function() { return false; } }],
        validator = this.fixture.createValidator({
            onValidated: handler,
            validationRules: validationRules
        });
    validator.validate();

    // act
    validator.reset();
    // assert
    assert.ok(handler.calledTwice, "Validated handler should be called two times - first one for validation, and second one for reset()");
    var params = handler.getCall(1).args[0];
    assert.ok(handler.calledOn(validator), "Correct context of action");
    // assert.equal(params.value, value, "Correct value was passed");
    // assert.equal(params.name, name, "Name of Validator should be passed");
    assert.strictEqual(params.validator, validator, "Validator reference should be passed");
    assert.strictEqual(params.isValid, true, "isValid was passed");
    assert.strictEqual(params.brokenRule, null, "Null should be passed as brokenRule ");
});

QUnit.module("Custom Adapters", {
    beforeEach: function() {
        this.fixture = new Fixture();
    },
    afterEach: function() {
        this.fixture.teardown();
    }
});

QUnit.test("Validator without adapter should throw exception", function(assert) {
    assert.throws(
        function() {
            this.fixture.createValidator({
                adapter: null,
                validationRules: [{
                    type: "required"
                }]
            });
        },
        function(e) {
            return /E0120/.test(e.message);
        },
        "Exception messages should be readable"
        );
});

QUnit.test("Attempt to set null adapter should throw exception", function(assert) {
    var that = this,
        validator = that.fixture.createValidator({
            adapter: {
                getValue: noop,
                validationRequestsCallbacks: $.Callbacks()
            },
            validationRules: [{
                type: "required"
            }]
        });
    assert.throws(
        function() {
            validator.option("adapter", null);
        },
        function(e) {
            return /E0120/.test(e.message);
        },
        "Exception messages should be readable"
        );
});


QUnit.test("Validation happens on firing callback, results are shown by our widgets (dxValidationSummary)", function(assert) {
    var that = this,
        adapter = {
            getValue: sinon.stub(),
            validationRequestsCallbacks: $.Callbacks()
        },
        validatedHandler = sinon.stub();

    that.fixture.createValidator({
        adapter: adapter,
        validationRules: [{
            type: "required"
        }],
        onValidated: validatedHandler
    });

    adapter.getValue.returns("123");
    // act
    adapter.validationRequestsCallbacks.fire();
    // assert
    assert.ok(adapter.getValue.calledOnce, "Value should be requested");
    assert.ok(validatedHandler.calledOnce, "Validated handler should be called");
});

QUnit.test("Validation happens on firing callback, result are applied through custom validator", function(assert) {
    var that = this,
        adapter = {
            getValue: sinon.stub(),
            validationRequestsCallbacks: $.Callbacks(),
            applyValidationResults: sinon.stub()
        },
        validatedHandler = sinon.stub();

    that.fixture.createValidator({
        adapter: adapter,
        validationRules: [{
            type: "required"
        }],
        onValidated: validatedHandler
    });

    adapter.getValue.returns("123");
    // act
    adapter.validationRequestsCallbacks.fire();
    // assert
    assert.ok(adapter.getValue.calledOnce, "Value should be requested");
    assert.ok(validatedHandler.calledOnce, "Validated handler should be called");
    assert.ok(adapter.applyValidationResults.calledOnce, "ApplyValidationResults function should be called");
});

QUnit.test("Validation happens on firing callback when validationRequestsCallbacks is array", function(assert) {
    var that = this,
        adapter = {
            getValue: sinon.stub(),
            validationRequestsCallbacks: []
        };

    that.fixture.createValidator({
        adapter: adapter,
        validationRules: [{
            type: "required"
        }]
    });

    adapter.getValue.returns("123");
    adapter.validationRequestsCallbacks.forEach(function(item) {
        item();
    });

    assert.ok(adapter.getValue.calledOnce, "Value should be requested");
});
