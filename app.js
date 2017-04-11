//BUDGET CONTROLLER
var budgetController = (function() {

})();

//UI CONTROLLER
var UIController = (function() {

})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

  var ctrlAddItem = function() {
    //Get input data

    //Add item to budget CONTROLLER

    //Add item to the UI

    //Calc budget

    //Display budget
    console.log("Pressed");
  }
  //Add listener for adding items to budget on button click.
  document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);
  //Add listener for adding items to budget on pressing enter key.
  document.addEventListener('keypress', function(event) {
    if(event.keyCode === 13 || event.which === 13) {
      ctrlAddItem();
    }
  });
})(budgetController, UIController);
