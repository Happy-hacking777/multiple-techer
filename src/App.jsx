import { useState, useEffect, useRef } from 'react'
import './App.css'

const operations = {
  '+/-': ['+', '-'],
  '*': ['*'],
  '*/:': ['*', '/'],
  'all': ['+', '-', '*', '/']
}

function calculateAnswer({ a, b, op }) {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return a / b
    default: return 0
  }
}

function getRandomNumber(max = 100) {
  return Math.floor(Math.random() * max) + 1
}

function getRandomOperation(ops) {
  return ops[Math.floor(Math.random() * ops.length)]
}

function generateExercise(mode, existing = []) {
  const ops = operations[mode]
  let attempts = 0
  let a, b, op, result
  let exercise

  const isMultOrDiv = ops.every(op => op === '*' || op === '/')
  
  do {
    a = isMultOrDiv ? getRandomNumber(10) : getRandomNumber()
    b = isMultOrDiv ? getRandomNumber(10) : getRandomNumber()
    op = getRandomOperation(ops)

    if (op === '/') {
      b = getRandomNumber(10)
      a = b * getRandomNumber(10)
    }

    result = calculateAnswer({ a, b, op })
    exercise = { a, b, op }
    attempts++
  } while (
    (result > 100 || result < 0 || !Number.isInteger(result)) ||
    existing.some(e => e.a === a && e.b === b && e.op === op)
  && attempts < 100)

  return exercise
}

function App() {
  const [mode, setMode] = useState(null)
  const [exercise, setExercise] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [previousExercises, setPreviousExercises] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (mode && score < 20) {
      const newExercise = generateExercise(mode, previousExercises)
      setExercise(newExercise)
      if (inputRef.current) inputRef.current.focus()
      setPreviousExercises(prev => [...prev, newExercise])
    }
  }, [mode, score])

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode)
    setScore(0)
    setUserAnswer('')
    setStartTime(Date.now())
    setEndTime(null)
    setTotalAttempts(0)
    setFeedback(null)
    setPreviousExercises([])
    const firstExercise = generateExercise(selectedMode)
    setExercise(firstExercise)
    if (inputRef.current) inputRef.current.focus()
    setPreviousExercises([firstExercise])
  }

  const handleAnswer = () => {
    const correct = calculateAnswer(exercise)
    const isCorrect = Number(userAnswer) === correct

    setScore(prev => Math.max(0, prev + (isCorrect ? 1 : -1)))
    setTotalAttempts(prev => prev + 1)
    setUserAnswer('')
    if (inputRef.current) inputRef.current.focus()
    setFeedback(isCorrect ? 'Super gemacht!' : 'Versuch es nochmal!')
    setTimeout(() => setFeedback(null), 1000)

    if (score + (isCorrect ? 1 : -1) < 20) {
      const next = generateExercise(mode, previousExercises)
      setExercise(next)
      setPreviousExercises(prev => [...prev, next])
    } else {
      setEndTime(Date.now())
    }
  }

  const handleRestart = () => {
    setMode(null)
    setExercise(null)
    setScore(0)
    setUserAnswer('')
    setStartTime(null)
    setEndTime(null)
    setTotalAttempts(0)
    setFeedback(null)
    setPreviousExercises([])
  }

  return (
    <div className="app-wrapper">
      <div className="container">
        {!mode ? (
          <div className="menu">
            <h1>Wähle eine Übungsart</h1>
            <button onClick={() => handleModeSelect('+/-')}>+ / -</button>
            <button onClick={() => handleModeSelect('*')}>×</button>
            <button onClick={() => handleModeSelect('*/:')}>× / :</button>
            <button onClick={() => handleModeSelect('all')}>Alle zusammen</button>
          </div>
        ) : score < 20 ? (
          <div className="game" style={{ padding: '2rem', gap: '3rem' }}>
            <div className="header" style={{
              fontSize: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button style={{ fontSize: '1.4rem', padding: '1rem 2rem' }} onClick={handleRestart}>← Zur Startseite</button>
              <div>Punkte: {score}</div>
            </div>
            {exercise && (
              <div className="exercise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <h2 style={{ fontSize: '2.8rem' }}>{exercise.a} {exercise.op === '/' ? ':' : exercise.op} {exercise.b} = ?</h2>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                  placeholder="Antwort"
                  className="answer-input"
                  ref={inputRef}
                  style={{
                    fontSize: '2.8rem',
                    fontFamily: 'inherit',
                    fontWeight: '600',
                    padding: '1rem',
                    width: '150px',
                    textAlign: 'center'
                  }}
                />
                <button style={{ fontSize: '1.6rem', padding: '1rem 2rem' }} onClick={handleAnswer}>Bestätigen</button>
              </div>
            )}
            {feedback === 'Super gemacht!' && <div className="feedback correct" style={{ marginTop: '2rem', fontSize: '2rem' }}>🎉 Super gemacht!</div>}
            {feedback === 'Versuch es nochmal!' && <div className="feedback wrong" style={{ marginTop: '2rem', fontSize: '2rem' }}>😢 Versuch es nochmal!</div>}
          </div>
        ) : (
          <div className="result">
            <h1>Spiel beendet!</h1>
            <p>Zeit: {((endTime - startTime) / 1000).toFixed(1)} sek</p>
            <p>Versuche: {totalAttempts}</p>
            <button onClick={handleRestart}>Nochmal spielen</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
