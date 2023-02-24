const budgetController = (function () {

    const Expense = function(id, description, value){
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }

    Expense.prototype.calcPercentages = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentages = function() {
        return this.percentage
    }

    const Income = function(id, description, value){
        this.id = id
        this.description = description
        this.value = value
    }

    const calculateTotal = function(type) {
        let sum = 0
        data.allItem[type].forEach(function(cur) {
            sum += cur.value
        })

        data.totals[type] = sum
    }

    const data = {
        allItem: {
            minus: [],
            plus: []
        },

        totals: {
            minus: 0,
            plus: 0
        },

        budget: 0,
        
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            let newItem, ID
            
            // create new ID
            if(data.allItem[type].length > 0){
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1
            } else{
                ID = 0
            }

            // create new item based on 'minus' or 'plus' type
            if(type === 'minus'){
                newItem = new Expense(ID, des, val)
            } else if(type === 'plus'){
                newItem = new Income(ID, des, val)
            }

            // Push it into our data structure
            data.allItem[type].push(newItem)

            // return the new element
            return newItem
        },

        deleteItem: function(type, id) {
            let ids, index

            ids = data.allItem[type].map(function(current) {
                return current.id
            })

            index = ids.indexOf(id)

            if(index !== -1) {
                data.allItem[type].splice(index, 1)
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('minus')
            calculateTotal('plus')

            // calculate the budget = income - expenses
            data.budget = data.totals.plus - data.totals.minus

            // Percentage of income spent
            if(data.totals.plus > 0){
                data.percentage = Math.round((data.totals.minus / data.totals.plus) * 100) 
            } else {
                data.percentage = -1
            }
        },

        calculatePercentages: function() {
            data.allItem.minus.forEach(function(e) {
                e.calcPercentages(data.totals.plus)
            })
        },

        getPercent: function() {
            const allPerc = data.allItem.minus.map(function(cur) {
                return cur.getPercentages()
            })

            return allPerc
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.plus,
                totalExp: data.totals.minus,
                percentage: data.percentage
            } 
        },

        testing: function() {
            return data
        }
    }
})()


// UI Controller
const UIController = (function() {
    const DOMstrings = {
        inputType: '.select-type',
        inputDescription: '.description',
        inputValue: '.value',
        inputCheck: '.check',
        incomeContainer: '.income',
        expenseContainer: '.expenses',
        totalMoney: '.total-amount',
        totalIncomeValue: '.total-income-money',
        totalExpenseValue: '.total-expenses-money',
        expensePercent: '.total-expenses-percent',
        display: '.display',
        expensesPercLabel: '.percentage',
        month: '.month',
        year: '.year'
    }

    const nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }

    const formatNumber = function(num, type) {
        /*
        + or - before number exactly 2 decimal points commas separating the thousands
        
        2310.23445 -> + 2,310.23
        */
        let numSplit, int, dec;

        num = Math.abs(num)
        num = num.toFixed(2)

        numSplit = num.split('.')

        int = numSplit[0]

        if(int.length > 3) {
            int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        } 

        dec = numSplit[1]

        return (type === 'minus' ? '-' : '+') + ' ' + int + '.' + dec
    }
    
    return {
        getInput: function() {
           return {
            type: document.querySelector(DOMstrings.inputType).value,

            discription: document.querySelector(DOMstrings.inputDescription).value,

            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
           }
        },

        addListItem: function(obj, type) {
            let html, newHtml, element;

            // Create HTML string with placeholder text
            if(type === 'plus'){
                element = DOMstrings.incomeContainer

                html = '<li id= "plus-%id%"><p class="description">%description%</p><div class= suppose-span><p class="amount-spent"><span>%value%</span></p><p class="remove">X</p></div></li>'
            } else if(type === 'minus'){
                element = DOMstrings.expenseContainer

                html = '<li id= "minus-%id%"><p class="description">%description%</p><div class= suppose-span><p class="expenses-p"><span class="expenses-percent">%value%</span><span class="percentage">40%</span></p><p class="remove">X</p></div></li>'
            }

            // Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: function(selectorID) {
            const el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)


        },

        clearFields: function() {
            let fields;
            
            fields =  document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue) // querySelectorAll returns a static nodeList hence there's need to convert it to an Array

            const fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach(function(current/* index, array*/) {
                current.value = ""
            })

            fieldsArr[0].focus()
        },

        displayBudget: function(obj) {
            let type
            obj.budget > 0 ? type = 'plus' : type = 'minus'

            document.querySelector(DOMstrings.totalMoney).textContent = formatNumber(obj.budget, type)

            document.querySelector(DOMstrings.totalIncomeValue).textContent = formatNumber(obj.totalInc, 'plus') 

            document.querySelector(DOMstrings.totalExpenseValue).textContent = formatNumber(obj.totalExp, 'minus')

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.expensePercent).textContent = obj.percentage + '%'  
            } else {
                document.querySelector(DOMstrings.expensePercent).textContent = '--'
            }
        },

        displayPercentages: function(percentages) {
            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel)

            nodeListForEach(fields, function(cur, index) {
                if(percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%'
                } else {
                    cur.textContent = '--'
                }
            })
        },

        displayMonth: function() {
            let now, month, months, year

            now = new Date()
            year = now.getFullYear()
            month = now.getMonth()
            months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

            document.querySelector(DOMstrings.month).textContent = months[month]
            document.querySelector(DOMstrings.year).textContent = year
        },

        changedType: function() {
            const fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            )

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus')
            })
        },

        getDOMstrings: function() {
            return DOMstrings
        }
    }

})()


// Global Controller
const controller = (function(budgetCtrl, UICtrl) {

    const setUpEventListener = function() {
        const DOM = UICtrl.getDOMstrings()

        document.querySelector(DOM.inputCheck).addEventListener('click', cntrlAddItem)
    
        document.addEventListener('keypress', function(e) {
            if(e.keyCode === 13 ){
                cntrlAddItem();
            }
        })

        document.querySelector(DOM.display).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    }

    const updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget()

        // 2. Return the budget
        const budget = budgetCtrl.getBudget()

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget)
    }

    const updatePercentages  = function() {
        // 1. calculate the percentages
        budgetCtrl.calculatePercentages()

        // 2. read percentages from budget controller
        const percentages = budgetCtrl.getPercent()

        // 3. update the UI with new percentages
        UICtrl.displayPercentages(percentages)
    }

    const cntrlAddItem = function() {
        let input, newItem

        // 1. Get the filed input data
        input = UICtrl.getInput()

        if(input.discription !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.discription, input.value)

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type)

            // 4. Clear the field
            UICtrl.clearFields()

            // 5. Calculate and Update budget
            updateBudget()

            // 6. Calculate and update percentages
            updatePercentages()
        }
        
    }

    const ctrlDeleteItem = function(e) {
        let itemId,splitID,type,ID
        itemId = e.target.parentNode.parentNode.id


        if(itemId) {
            // plus-0
            splitID = itemId.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])

            // 1. delete the item frm data structure
            budgetCtrl.deleteItem(type, ID)

            // 2. delete the item from UI
            UICtrl.deleteListItem(itemId)

            // 3. update and show new budget
            updateBudget()

            // 4. Calculate and update percentages
            updatePercentages()
        }
    }

    return {
        init: function() {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            UICtrl.displayMonth()
            setUpEventListener()
        }
    }

})(budgetController, UIController)

controller.init()