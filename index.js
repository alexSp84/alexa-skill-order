const Alexa = require('ask-sdk');

const StartMessage = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
        .addDelegateDirective('orderDialog')
        .getResponse();
  },
};

const StartOrder = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
        request.intent.name === 'orderDialog' &&
        handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED' &&
        request.intent.slots.foodType.value;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
        .addDelegateDirective()
        .getResponse();
  },
};

const ShippingMethod = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
        request.intent.name === 'orderDialog' &&
        handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
        request.intent.slots.shippingType.value &&
        (request.intent.slots.shippingType.value === 'delivery' || request.intent.slots.shippingType.value === 'go there') &&
        !request.intent.slots.restaurantList.value;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
        .addDelegateDirective()
        .getResponse();
  },
};

const SelectRestaurant = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
        request.intent.name === 'orderDialog' &&
        handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
        request.intent.slots.restaurantList.value &&
        request.intent.slots.restaurantList.resolutions.resolutionsPerAuthority[0].status.code &&
        request.intent.slots.restaurantList.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const food = request.intent.slots.foodType.value;
    const shipping = request.intent.slots.shippingType.value;
    const restaurant = request.intent.slots.restaurantList.value;
    return handlerInput.responseBuilder
        .speak(`Order Summary: pizza ${food}, delivery method: ${shipping}, restaurant: ${restaurant}`)
        .addDelegateDirective()
        .getResponse();
  },
};

const Payment = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
        request.intent.name === 'orderDialog' &&
        handlerInput.requestEnvelope.request.dialogState === 'COMPLETED'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
        .speak('The order is placed, the delivery will be in 30 minutes')
        .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
        .speak(HELP_MESSAGE)
        .reprompt(HELP_REPROMPT)
        .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && (request.intent.name === 'AMAZON.CancelIntent'
            || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
        .speak(STOP_MESSAGE)
        .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
        .speak('Sorry, an error occurred.')
        .reprompt('Sorry, an error occurred.')
        .getResponse();
  },
};

const SKILL_NAME = 'Pizza search';
const HELP_MESSAGE = 'Help Message';
const HELP_REPROMPT = 'Help reprompt';
const STOP_MESSAGE = 'Goodbye!';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
    .addRequestHandlers(
        StartMessage,
        StartOrder,
        ShippingMethod,
        SelectRestaurant,
        Payment,
        HelpHandler,
        ExitHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
