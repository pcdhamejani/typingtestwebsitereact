import React, { useState, useRef, useEffect } from 'react'
import { quotesArray, random, allowedKeys } from './Quotes'
import ItemList from './components/ItemList'
import './App.css'

const App = () => {
  const inputRef = useRef(null)
  const outputRef = useRef(null)
  const [duration, setDuration] = useState(60)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [index, setIndex] = useState(0)
  const [correctIndex, setCorrectIndex] = useState(0)
  const [errorIndex, setErrorIndex] = useState(0)
  const [quote, setQuote] = useState({})
  const [input, setInput] = useState('')
  const [cpm, setCpm] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [isError, setIsError] = useState(false)
  const [lastScore, setLastScore] = useState('0')

  useEffect(() => {
    const newQuote = random(quotesArray)
    setQuote(newQuote)
    setInput(newQuote.quote)
  }, [])

  const handleEnd = () => {
    setEnded(true)
    setStarted(false)
  }

  const handleStart = () => {
    setStarted(true)
    setEnded(false)
    setInput(quote.quote)
    inputRef.current.focus()
    setDuration(60)
  }

  useEffect(() => {
    let interval
    if (started && !ended && duration > 0) {
      interval = setInterval(() => {
        setDuration((prevDuration) => prevDuration - 1)
      }, 1000)
    } else if (duration === 0) {
      handleEnd()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [started, ended, duration])

  useEffect(() => {
    if (started && !ended) {
      const timeElapsed = 60 - duration
      if (timeElapsed > 0) {
        const _cpm = Math.round((correctIndex / timeElapsed) * 60)
        const _wpm = Math.round(_cpm / 5)
        const _accuracy = Math.floor((correctIndex / (correctIndex + errorIndex)) * 100) || 0
        setCpm(_cpm)
        setWpm(_wpm)
        setAccuracy(_accuracy)
      }
    }
  }, [duration, started, ended, correctIndex, errorIndex])

  const handleKeyDown = e => {
    e.preventDefault()
    const { key } = e
    const quoteText = quote.quote

    if (key === quoteText.charAt(index)) {
      setIndex(index + 1)
      const remainingText = quoteText.substring(index + 1)
      setInput(remainingText)
      setCorrectIndex(prevCorrectIndex => prevCorrectIndex + 1)
      setIsError(false)
      outputRef.current.innerHTML += key
    } else {
      if (allowedKeys.includes(key)) {
        setErrorIndex(prevErrorIndex => prevErrorIndex + 1)
        setIsError(true)
        outputRef.current.innerHTML += `<span class="text-danger">${key}</span>`
      }
    }

    if (index + 1 === quoteText.length || errorIndex > 50) {
      handleEnd()
    }
  }

  useEffect(() => {
    if (ended) localStorage.setItem('wpm', wpm)
  }, [ended, wpm])

  useEffect(() => {
    const storedScore = localStorage.getItem('wpm')
    if (storedScore) setLastScore(storedScore)
  }, [])

  return (
    <div className="App">
      <div className="container-fluid pt-4">
        <div className="row">
          {/* Left */}
          <div className="col-sm-6 col-md-2 order-md-0 px-5">
            <ul className="list-unstyled text-center small">
              <ItemList
                name="WPM"
                data={wpm}
                style={
                  wpm > 0 && wpm < 20 ? (
                    { color: 'white', backgroundColor: '#eb4841' }
                  ) : wpm >= 20 && wpm < 40 ? (
                    { color: 'white', backgroundColor: '#f48847' }
                  ) : wpm >= 40 && wpm < 60 ? (
                    { color: 'white', backgroundColor: '#ffc84a' }
                  ) : wpm >= 60 && wpm < 80 ? (
                    { color: 'white', backgroundColor: '#a6c34c' }
                  ) : wpm >= 80 ? (
                    { color: 'white', backgroundColor: '#4ec04e' }
                  ) : (
                    {}
                  )
                }
              />
              <ItemList name="CPM" data={cpm} />
              <ItemList name="Last Score" data={lastScore} />
            </ul>
          </div>
          {/* Body */}
          <div className="col-sm-12 col-md-8 order-md-1">
            <div className="container">
              <div className="text-center mt-4 header">
                <h1>How Fast Can You Type?</h1>
                <p className="lead">
                  Start the one-minute Typing speed test and find out how fast can you type in real
                  world!
                </p>

                <div className="alert alert-danger" role="alert">
                  Just start typing and don't use <b>backspace</b> to correct your mistakes. Your
                  mistakes will be marked in <u>Red</u> color and shown below the writing box. Good
                  luck!
                </div>

                <div className="control my-5">
                  {ended ? (
                    <button
                      className="btn btn-outline-danger btn-circle"
                      onClick={() => window.location.reload()}
                    >
                      Reload
                    </button>
                  ) : started ? (
                    <button className="btn btn-circle btn-outline-success" disabled>
                      Hurry
                    </button>
                  ) : (
                    <button className="btn btn-circle btn-outline-success" onClick={handleStart}>
                      GO!
                    </button>
                  )}
                  <span className="btn-circle-animation" />
                </div>
              </div>

              {ended ? (
                <div className="bg-dark text-light p-4 mt-5 lead rounded">
                  <span>"{quote.quote}"</span>
                  <span className="d-block mt-2 text-muted small">- {quote.author}</span>
                </div>
              ) : started ? (
                <div
                  className={`text-light mono quotes${started ? ' active' : ''}${isError
                    ? ' is-error'
                    : ''}`}
                  tabIndex="0"
                  onKeyDown={handleKeyDown}
                  ref={inputRef}
                >
                  {input}
                </div>
              ) : (
                <div className="mono quotes text-muted" tabIndex="-1" ref={inputRef}>
                  {input}
                </div>
              )}

              <div className="p-4 mt-4 bg-dark text-light rounded lead" ref={outputRef} />

              <h6 className="mt-5">Tip!</h6>
              <ul>
                <li>
                  Word Per Minute (WPM) is measured by calculating how many words you can type in 1
                  minute.
                </li>
                <li>Character Per Minute (CPM) calculates how many characters are typed per minute.</li>
                <li>
                  The top typing speed was achieved by{' '}
                  <a
                    href="https://en.wikipedia.org/wiki/Typing#Alphanumeric_entry"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Stella Pajunas
                  </a>{' '}
                  in 1946, whereas Mrs. Barbara Blackburn has averaged 150 wpm in 50 minutes and her
                  top speed was 212 wpm.
                </li>
              </ul>
              <hr className="my-4" />
              <div className="mb-5">
                <h6 className="py-2">Average Typing Speeds</h6>
                <div className="d-flex text-white meter-gauge">
                  <span className="col" style={{ background: '#eb4841' }}>
                    0 - 20 Slow
                  </span>
                  <span className="col" style={{ background: '#f48847' }}>
                    20 - 40 Average
                  </span>
                  <span className="col" style={{ background: '#ffc84a' }}>
                    40 - 60 Fast
                  </span>
                  <span className="col" style={{ background: '#a6c34c' }}>
                    60 - 80 Professional
                  </span>
                  <span className="col" style={{ background: '#4ec04e' }}>
                    80 - 100+ Top
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-md-2 order-md-2 px-5">
            <ul className="list-unstyled text-center small">
              <ItemList name="Timers" data={duration} />
              <ItemList name="Errors" data={errorIndex} />
              <ItemList name="Acuracy" data={accuracy} symble="%" />
            </ul>
          </div>
        </div>

        <footer className="small text-muted pt-5 pb-2 footer">
          <div className="footer-info text-center">
            v1.0.0
            <div className="copyright">
              © 2024 - Parth Dhamejani. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App