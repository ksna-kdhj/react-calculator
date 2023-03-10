import { useReducer,useState,useEffect } from "react"
import DigitButton from "./DigitButton"
import OperationButton from "./OperationButton"
import "./styles.css"

const LOCAL_STORAGE_KEY=  "calculator.calc"
const LOCAL_STORAGE_KEY_SCI = "calculator.calc.sci"
const LOCAL_STORAGE_KEY_HIST = "calculator.calc.hist"
let history=[]
let prev_cache=""
let cur_cache=""
let operation_cache=""
let histScroll=''
let histGlobalRef=''
export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
  TOGGLE_HISTORY_ON:'toggle-history-on',
  TOGGLE_HISTORY_OFF:'toggle-history-off',
  SCROLL_HISTORY:'scroll-history'
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
  // console.log(splValue)
  return splValue.toString()
}
const unaryOps=["Sin","Cos","Tan","!","log","sqrt","sqr","±"]
function reducer(state, { type, payload }) {
  if(type==ACTIONS.TOGGLE_HISTORY_ON){
  prev_cache=state.previousOperand
  cur_cache=state.currentOperand
  operation_cache=state.operation
  }
  // console.log(prev_cache,cur_cache,operation_cache)
  switch (type) {
    case ACTIONS.ADD_DIGIT:
    if(histGlobalRef===true){
      histGlobalRef=false
      return{
        previousOperand:(prev_cache!=""?prev_cache:null),
        currentOperand:(cur_cache!=""?cur_cache:null),
       operation:(operation_cache!=""?operation_cache:null),
      overwrite:false
      }
    }
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
      if(histGlobalRef===true){
        histGlobalRef=false
        if(unaryOps.includes(payload.operation)){
          return {
          previousOperand:evaluate({currentOperand:state.currentOperand,previousOperand:null,operation:payload.operation}),
          currentOperand:null,
          operation:null,
          overwrite:false,
          }
        }
        return{
          previousOperand:state.currentOperand,
          currentOperand:null,
          operation:payload.operation,
          overwrite:false,
        }
      }
      if (payload.operation ==="^"){
        if (state.currentOperand == null && state.previousOperand == null) {
          return{
            state
          }
        }
        if(state.previousOperand == null){
          return{
            ...state,
            previousOperand: state.currentOperand,
            operation:payload.operation,
            currentOperand:null
          }
        }
        if(state.currentOperand==null && state.operation!="^")
        return {
          ...state,
          operation:payload.operation,
          currentOperand: null,
          }
      }
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
      if(histGlobalRef===true){
        histGlobalRef=false
        return{
        previousOperand:prev_cache,
        currentOperand:cur_cache,
        operation:operation_cache,
        overwrite:false
        }
      }
      return{}
    case ACTIONS.DELETE_DIGIT:
      if(histGlobalRef===true){
        histGlobalRef=false
        return{
        previousOperand:prev_cache,
        currentOperand:cur_cache,
        operation:operation_cache,
        overwrite:false
        }
      }
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
      if(histGlobalRef===true){
        histGlobalRef=false
        return{
          overwrite:false,
          currentOperand:state.currentOperand,
          previousOperand:null,
          operation: null
        }
      }
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
    case ACTIONS.TOGGLE_HISTORY_ON:
      // console.log('hi')
      return{
        previousOperand:history[histScroll-1],
        currentOperand:history[histScroll],
        operation:null,
        overwrite:true
      }
    case ACTIONS.TOGGLE_HISTORY_OFF:
      return{
      previousOperand:(prev_cache!=""?prev_cache:null),
       currentOperand:(cur_cache!=""?cur_cache:null),
      operation:(operation_cache!=""?operation_cache:null),
      overwrite:false
      }
    case ACTIONS.SCROLL_HISTORY:
      return{
        previousOperand:(histScroll===0?history[history.length-1]:history[histScroll-1]),
        currentOperand:history[histScroll],
        operation:null,
        overwrite:true
      }
  }
}
function factorial (current){
 return (current > 1) ? current * factorial(current-1) : 1
}
function evaluate({ currentOperand, previousOperand, operation }) {
  let computation = ""
  // if(histGlobalRef===true){
  //   console.log(histGlobalRef)
  //   computation = currentOperand
  //   return computation
  // }
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  const curPower = parseFloat(currentOperand.split())
  if(!unaryOps.includes(operation)){
  if (isNaN(prev) || isNaN(current)) return ""
  }
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
    case "^":
      computation = Math.pow(prev,current)
      break
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
  if(history.length>9){
    history.shift()
    // console.log(history.length)
  }
  history.push(computation.toString())
  // console.log(history)
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
  const [hist,setHist] = useState()
  // JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_HIST))
  const handleHistoryScroll= (type)=>{
    if (type=="prev"){
      if(histScroll==0){
        histScroll= history.length-1
      }
      else{
        histScroll = histScroll-1
      }
    }
    if(type=="next"){
      if(histScroll==history.length-1){
        histScroll = 0
      }
      else{
        histScroll=histScroll+1
      }
    }
    dispatch({type:ACTIONS.SCROLL_HISTORY})
    }
  const handleHistoryClick= ()=>{
    if(hist!=null){
   const histState= hist
   setHist(!histState)
   histGlobalRef=hist
    }
    else{
    setHist(true)
    histGlobalRef=true
    // console.log('this is history set true')
    }
    if(hist===true){
    // console.log('im here')
    histScroll=(history.length-1)
    // console.log('showing history now')
    dispatch({type: ACTIONS.TOGGLE_HISTORY_ON})
    // return((<>-hist</>))
    }
    else{
      // console.log('not showing history now')
    dispatch({type: ACTIONS.TOGGLE_HISTORY_OFF})
    // return((<>hide-hist</>))
    }
  }
  // useEffect(()=>{
  //   localStorage.setItem(LOCAL_STORAGE_KEY_HIST,JSON.stringify(hist))
  // },[hist])
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
      <div id="wrapper">
      <div className="historysci">
          <button onClick={handleHistoryClick}>{hist==false?(<>hide-hist</>):(<>show-hist</>)}</button>
      </div>
      <div className="historyNavigatesci">
      {hist==false?(
        <>
      <br></br>
      <button onClick={()=>handleHistoryScroll("prev")}>&#11165;</button>
      <br></br>
      <button onClick={()=>handleHistoryScroll("next")}>&#11167;</button>
      </>
      ):(
        <>
        </>
      )}
      </div>
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
    </div>
    )
  }
  return (
    <div id="wrapper">
    <div className="history">
      <button onClick={handleHistoryClick}>{hist==false?(<>hide-hist</>):(<>show-hist</>)}</button>
    </div>
    <div className="historyNavigate">
      {hist==false?(
        <>
      <br></br>
      <button onClick={()=>handleHistoryScroll("prev")}>&#11165;</button>
      <br></br>
      <button onClick={()=>handleHistoryScroll("next")}>&#11167;</button>
      </>
      ):(
        <>
        </>
      )}
    </div>
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
    </div>
  )
}

export default App