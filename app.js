//BUDGET CONTROLLER
var budgetController = (function() {

})();

//UI CONTROLLER
var UIController = (function() {

  //Storage for strings from DOM if needed for changes.
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
  };

  return {
    //Method to return all three values at the same time via object.
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, //Either inc or exp.
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: document.querySelector(DOMStrings.inputValue).value
      };
    },
    //Expose DOMStrings object for use in other controllers.
    getDomStrings: function() {
      return DOMStrings;
    }
  };
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

  //Call getDomStrings method of UIController to make them available inside this controller.
  var DOM = UIController.getDomStrings();

  var ctrlAddItem = function() {
    //Get input data via getInput method on UIController object.
    var input = UICtrl.getInput();
    console.log(input);
    //Add item to budget CONTROLLER

    //Add item to the UI

    //Calc budget

    //Display budget
  };
  //Add listener for adding items to budget on button click.
  document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
  //Add listener for adding items to budget on pressing enter key.
  document.addEventListener('keypress', function(event) {
    if(event.keyCode === 13 || event.which === 13) {
      ctrlAddItem();
    }
  });
})(budgetController, UIController);
