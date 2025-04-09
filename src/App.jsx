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
  const [gifToShow, setGifToShow] = useState(null)
  const inputRef = useRef(null)
  const gifs = ['/gifs/cat1.gif', '/gifs/cat2.gif', '/gifs/dog1.gif', '/public/gifs/cat3.gif', '/public/gifs/cat4.gif', '/public/gifs/cat5.gif', '/public/gifs/cat6.gif', '/public/gifs/dog2.gif', '/public/gifs/dog3.gif', '/public/gifs/dog4.gif', '/public/gifs/dog5.gif']

  useEffect(() => {
    if (mode && score < 15) {
      const newExercise = generateExercise(mode, previousExercises)
      setExercise(newExercise)
      if (inputRef.current) inputRef.current.focus()
      setPreviousExercises(prev => [...prev, newExercise])
    }
  }, [mode, score])

  useEffect(() => {
    if (!gifToShow && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gifToShow])

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
    setFeedback(isCorrect ? 'Super gemacht!' : '😢 Falsch')
    setTimeout(() => setFeedback(null), 1000)

    if (isCorrect) {
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)]
      setGifToShow(randomGif)
      setTimeout(() => setGifToShow(null), 40000)
    }

    if (score + (isCorrect ? 1 : -1) < 20) {
      if (isCorrect) {
        const next = generateExercise(mode, previousExercises)
        setExercise(next)
        setPreviousExercises(prev => [...prev, next])
      } else {
        setTimeout(() => {
          const next = generateExercise(mode, previousExercises)
          setExercise(next)
          setPreviousExercises(prev => [...prev, next])
        }, 1200)
      }
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
    setGifToShow(null)
  }

  return (
    <div className="container">
      {!mode ? (
        <div className="menu" style={{ textAlign: 'center' }}>
          <h1>Was möchtest du üben? 🤔📚🐶</h1>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => handleModeSelect('+/-')} style={{ backgroundColor: '#ffd166', color: '#333', padding: '1rem 2rem', borderRadius: '10px', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
              ➕ ➖
            </button>
            <button onClick={() => handleModeSelect('*')} style={{ backgroundColor: '#06d6a0', color: 'white', padding: '1rem 2rem', borderRadius: '10px', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
              ✖️
            </button>
            <button onClick={() => handleModeSelect('*/:')} style={{ backgroundColor: '#ef476f', color: 'white', padding: '1rem 2rem', borderRadius: '10px', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
              ✖️ ➗
            </button>
            <button onClick={() => handleModeSelect('all')} style={{ backgroundColor: '#118ab2', color: 'white', padding: '1rem 2rem', borderRadius: '10px', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
              Alle zusammen 🎲
            </button>
          </div>
        </div>
      ) : score < 2 && endTime === null ? (
        <div className="game" style={{ textAlign: 'center', padding: '2rem', transform: 'translateY(-2%)' }}>
          {gifToShow ? (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: '2rem',
                  color: '#2e8b57',
                  backgroundColor: '#e0ffe0',
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px'
                }}>
                  ✅ Richtig!
                </h2>
              </div>
              <div className="gif-wrapper" style={{ marginTop: '1.5rem' }}>
                <img src={gifToShow} alt="Belohnung" />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <button
                  onClick={handleRestart}
                  style={{
                    fontSize: '1.2rem',
                    padding: '0.7rem 1.5rem',
                    backgroundColor: '#adb5bd',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  ← Zur Startseite
                </button>
              </div>
              <div
                style={{
                  backgroundColor: '#ffe066',
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '1.6rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '1rem'
                }}
              >
                Punkte: <span style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>⭐ {score}</span>
              </div>

              {exercise && (
                <div className="exercise" style={{ margin: '2rem 0' }}>
                  <h2 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#073b4c' }}>
                    {exercise.a} {exercise.op === '/' ? ':' : exercise.op} {exercise.b} = ?
                  </h2>
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                    placeholder="Antwort"
                    className="answer-input"
                    ref={inputRef}
                    style={{
                      fontSize: '2rem',
                      padding: '1rem',
                      width: '195px',
                      borderRadius: '10px',
                      border: '2px solid #118ab2',
                      appearance: 'none',
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none',
                      textAlign: 'center'
                    }}
                    inputMode="numeric"
                  />
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={handleAnswer}
                      style={{
                        marginTop: '1rem',
                        fontSize: '1.5rem',
                        padding: '0.8rem 2rem',
                        backgroundColor: '#06d6a0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      Bestätigen ✅
                    </button>
                  </div>
                </div>
              )}
              {feedback && <div className="feedback" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>{feedback}</div>}
            </>
          )}
        </div>
      ) : (
        <div className="result" style={{
          backgroundColor: '#f0f8ff',
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#2e8b57' }}>🌟🎉 Super gespielt! 🎉🌟</h1>
          <p style={{ fontSize: '1.8rem', marginTop: '1rem' }}>
            Du hast <strong>15 Punkte</strong> gesammelt! 🐶🥳🏆💪✨
          </p>
          <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
            Versuche: <strong>{totalAttempts}</strong> 🎯🧠
          </p>
          <p style={{ fontSize: '1.5rem', color: '#444', marginTop: '1rem' }}>
            Du bist ein Mathe-Champion! 🧮👑🍀
          </p>
          <button onClick={handleRestart} style={{
            marginTop: '2rem',
            fontSize: '1.4rem',
            padding: '1rem 2rem',
            backgroundColor: '#2e8b57',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}>
            Nochmal spielen 🔁
          </button>
        </div>
      )}
    </div>
  )
}

export default App