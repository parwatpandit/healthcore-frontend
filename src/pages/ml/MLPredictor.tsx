import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Brain, Activity, AlertCircle, CheckCircle } from 'lucide-react'

interface Prediction {
  disease: string
  confidence: number
}

interface PredictionResult {
  primary_prediction: string
  top_predictions: Prediction[]
  symptoms_analysed: string[]
  total_symptoms_checked: number
}

const SYMPTOM_LABELS: Record<string, string> = {
  fever: 'Fever',
  cough: 'Cough',
  headache: 'Headache',
  fatigue: 'Fatigue',
  shortness_of_breath: 'Shortness of Breath',
  chest_pain: 'Chest Pain',
  nausea: 'Nausea',
  sore_throat: 'Sore Throat',
  runny_nose: 'Runny Nose',
  muscle_pain: 'Muscle Pain',
  loss_of_taste: 'Loss of Taste',
  rash: 'Rash',
  diarrhea: 'Diarrhea',
  dizziness: 'Dizziness',
}

const CONFIDENCE_COLOR = (confidence: number) => {
  if (confidence >= 60) return '#34d399'
  if (confidence >= 30) return '#fbbf24'
  return '#f87171'
}

export default function MLPredictor() {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const res = await api.get('/ml/symptoms/')
        setSymptoms(res.data.symptoms)
      } catch {
        setError('Failed to load symptoms')
      }
    }
    fetchSymptoms()
  }, [])

  const toggleSymptom = (symptom: string) => {
    setSelected(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
    setResult(null)
  }

  const handlePredict = async () => {
    if (selected.length === 0) {
      setError('Please select at least one symptom')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/ml/predict/', { symptoms: selected })
      setResult(res.data)
    } catch {
      setError('Prediction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelected([])
    setResult(null)
    setError('')
  }

  return (
    <div className="text-white">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Brain size={18} style={{ color: '#818cf8' }} />
          </div>
          <h1 className="text-2xl font-bold text-white">Disease Predictor</h1>
        </div>
        <p className="text-gray-500 text-sm ml-11">
          Select the patient's symptoms to get an AI-powered disease prediction
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Symptoms Selector */}
        <div className="col-span-2">
          <div className="rounded-xl p-5 mb-4"
            style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Select Symptoms</h2>
              <span className="text-xs text-gray-500">{selected.length} selected</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {symptoms.map(symptom => {
                const isSelected = selected.includes(symptom)
                return (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left"
                    style={{
                      background: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      color: isSelected ? '#a5b4fc' : '#9ca3af',
                    }}
                  >
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected ? '#6366f1' : 'rgba(255,255,255,0.05)',
                        border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      }}>
                      {isSelected && <CheckCircle size={12} color="#fff" />}
                    </div>
                    {SYMPTOM_LABELS[symptom] || symptom}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Symptoms Tags */}
          {selected.length > 0 && (
            <div className="rounded-xl p-4 mb-4"
              style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Selected Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {selected.map(s => (
                  <span
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition hover:opacity-70"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
                  >
                    {SYMPTOM_LABELS[s]} ×
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePredict}
              disabled={loading || selected.length === 0}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)' }}
            >
              {loading ? 'Analysing...' : 'Predict Disease'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl text-sm font-medium text-gray-400 transition"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="col-span-1">
          {!result ? (
            <div className="rounded-xl p-5 flex flex-col items-center justify-center text-center h-full"
              style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', minHeight: '300px' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(99,102,241,0.1)' }}>
                <Activity size={24} style={{ color: '#6366f1' }} />
              </div>
              <p className="text-gray-400 text-sm font-medium">No prediction yet</p>
              <p className="text-gray-600 text-xs mt-1">Select symptoms and click Predict</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">

              {/* Primary Prediction */}
              <div className="rounded-xl p-5 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(56,189,248,0.15))', border: '1px solid rgba(99,102,241,0.3)' }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(30%, -30%)' }} />
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Primary Diagnosis</p>
                <h2 className="text-2xl font-bold text-white mb-1">{result.primary_prediction}</h2>
                <p className="text-indigo-400 text-xs">
                  {result.top_predictions[0]?.confidence}% confidence
                </p>
              </div>

              {/* Top Predictions */}
              <div className="rounded-xl p-5"
                style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">All Predictions</p>
                <div className="flex flex-col gap-3">
                  {result.top_predictions.map((pred, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">{pred.disease}</span>
                        <span className="text-xs font-bold" style={{ color: CONFIDENCE_COLOR(pred.confidence) }}>
                          {pred.confidence}%
                        </span>
                      </div>
                      <div className="w-full rounded-full h-1.5"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${pred.confidence}%`,
                            background: CONFIDENCE_COLOR(pred.confidence)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl p-4"
                style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                <div className="flex items-start gap-2">
                  <AlertCircle size={13} style={{ color: '#fbbf24', marginTop: '1px', flexShrink: 0 }} />
                  <p className="text-xs" style={{ color: '#fbbf24' }}>
                    This is an AI-assisted prediction only. Always consult a qualified medical professional for diagnosis and treatment.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}