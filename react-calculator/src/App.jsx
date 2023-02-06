import { useReducer,useState,useEffect } from "react"
import DigitButton from "./DigitButton"
import OperationButton from "./OperationButton"
import "./styles.css"

const LOCAL_STORAGE_KEY=  "calculator.calc"
const LOCAL_STORAGE_KEY_SCI = "calculator.calc.sci"
let history=[]
export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
}
const splConsts=["e","𝝿"]
function getConstant(splConst){
  let splValue=''
  switch(splConst){
    case "e":
      splValue = Math.E
      break
    case "𝝿":
      splValue = Math.PI
      break
  }
  console.log(splValue)
  return splValue.toString()
}
const unaryOps=["Sin","Cos","Tan","!","log","sqrt","sqr","^","±"]
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
    if(splConsts.includes(payload.digit)){
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: getConstant(payload.digit),
          overwrite: true,
        }
      }
      if (state.currentOperand === "0"||state.currentOperand===".") {
        return{ 
          ...state,
          currentOperand: getConstant(payload.digit),
          overwrite:true,
        }
      }
      return {
        ...state,
        currentOperand: getConstant(payload.digit),
        overwrite: true
      }
    }
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state
      }
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state
      }
      if(state.previousOperand!=null && state.currentOperand==null&&state.operation==null){
        return{...state,
        previousOperand:null,
        currentOperand:payload.digit,
        }
      }

      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }
    case ACTIONS.CHOOSE_OPERATION:
      if(unaryOps.includes(payload.operation)){
        if (state.currentOperand == null && state.previousOperand == null) {
          return{
            ...state,
            operation:payload.operation
          }
        }  
        if (state.currentOperand == null && unaryOps.includes(state.operation)) {
          return {
            ...state,
            previousOperand:null,
            operation: payload.operation,
          }
        }
          if (state.currentOperand == null && !unaryOps.includes(state.operation)) {
            return {
              ...state,
              currentOperand:evaluate({currentOperand:state.previousOperand,previousOperand:state.previousOperand,operation:payload.operation}),
              previousOperand:null,
              operation: null,
            }
        }
        if (state.previousOperand == null) {
          return {
            ...state,
            operation: null,
            previousOperand: evaluate({currentOperand:state.currentOperand,previousOperand:state.previousOperand,operation:payload.operation}),
            currentOperand: null,
          }
        }
         return {
          ...state,
          previousOperand: evaluate({currentOperand:state.currentOperand,previousOperand:state.previousOperand,operation:payload.operation}),
          operation:null,
          currentOperand: null,
          }
        }
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }
    case ACTIONS.CLEAR:
      history=[]
      return {}
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      if (state.currentOperand == null) return state
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null }
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      }
    case ACTIONS.EVALUATE:
      if(unaryOps.includes(state.operation)){
        return {
          ...state,
          overwrite: true,
          previousOperand: null,
          operation: null,
          currentOperand: evaluate(state),
        }
      }
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state
      }

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }
  }
}
function factorial (current){
 return (current > 1) ? current * factorial(current-1) : 1
}
function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if(!unaryOps.includes(operation)){
  if (isNaN(prev) || isNaN(current)) return ""
  }
  let computation = ""
  switch (operation) {
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "×":
      computation = prev * current
      break
    case "÷":
      computation = prev / current
      break
    case "Sin":
      computation = Math.sin(current*Math.PI/180)
      break
    case "Cos":
      computation = Math.cos(current*Math.PI/180)
      break
    case "Tan":
      computation = Math.tan(current*Math.PI/180)
      break
    // case "^":
    //   computation = Math.cos(current)
    //   break
    case "sqrt":
      computation = Math.sqrt(current)
      break
    case "sqr":
      computation = Math.pow(current,2)
      break
    case "!":
      computation=factorial(current)
      break
    case "log":
      computation = Math.log(current)
      break
    case"±":
      computation = current*(-1)
      break
  }
  if(history.length>=10){
    history.shift()
    console.log(history)
    history.push(computation.toString())
    console.log(history.length)
  }
  history.push(computation.toString())
  return computation.toString()
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})
function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split(".")
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  const [{ currentOperand, previousOperand, operation, overwrite }, dispatch] = useReducer(
    reducer,
    {},(initial)=>JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))||initial
  )
  const [sci,setSci] = useState(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_SCI)))
  useEffect(()=>{
    localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify({currentOperand,previousOperand,operation,overwrite}))
  },[currentOperand,previousOperand,operation,overwrite])
  const handleSciClick = ()=>{
    if(sci){
   const sciState= sci
   setSci(!sciState)
    }
    else{
      setSci(true)
    }
  }
  useEffect(()=>{
    localStorage.setItem(LOCAL_STORAGE_KEY_SCI,JSON.stringify(sci))
  },[sci])
  if(sci==true){
    return(
      <>
      <div className="historysci">
          <button>history</button></div>
      <div className="calculator-grid-sci">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>
      <OperationButton operation="±" dispatch={dispatch}/>
      <OperationButton operation="÷" dispatch={dispatch} />
      <OperationButton operation="Sin" dispatch={dispatch}/>
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="×" dispatch={dispatch} />
      <OperationButton operation="Cos" dispatch={dispatch}/>
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <OperationButton operation="Tan" dispatch={dispatch}/>
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="e" dispatch={dispatch}/>
      <OperationButton operation="^" dispatch={dispatch}/>
      <OperationButton operation="sqrt" dispatch={dispatch}/>
      <OperationButton operation="sqr" dispatch={dispatch}/>
      <OperationButton operation="!" dispatch={dispatch}/>
      <OperationButton operation="log" dispatch={dispatch}/>
      <DigitButton digit="𝝿" dispatch={dispatch}/>

      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button onClick={handleSciClick}>Sci</button>
      <button
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
    </>
    )
  }
  return (
    <>
    <div className="history">
          <button>history</button></div>
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>
      <OperationButton operation="±" dispatch={dispatch}/>
      <OperationButton operation="÷" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="×" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button onClick={handleSciClick}>Sci</button>
      <button
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
    </>
  )
}

export default App