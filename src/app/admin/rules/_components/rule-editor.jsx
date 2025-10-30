'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { saveRulesAction } from '../actions'
import { useRouter } from 'next/navigation'

export default function RuleEditor({ initialRules }) {
  const router = useRouter()
  const [rules, setRules] = useState(initialRules)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await saveRulesAction(rules)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          router.refresh()
        }, 2000)
      } else {
        setError(result.error || 'Failed to save rules')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const addRule = () => {
    setRules([
      ...rules,
      {
        name: '',
        priority: 0,
        conditions: { all: [] },
        event: { type: 'auto-approve', params: {} },
      },
    ])
  }

  const updateRule = (index, field, value) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], [field]: value }
    setRules(newRules)
  }

  const deleteRule = (index) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {rules.length} rule{rules.length !== 1 ? 's' : ''} defined
        </p>
        <Button onClick={addRule}>Add Rule</Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 text-green-600">
          Rules saved successfully!
        </div>
      )}

      {rules.map((rule, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <CardTitle>Rule {index + 1}</CardTitle>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`name-${index}`}>Name</Label>
                    <Input
                      id={`name-${index}`}
                      value={rule.name}
                      onChange={(e) => updateRule(index, 'name', e.target.value)}
                      placeholder="e.g., Auto-approve small expenses"
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor={`priority-${index}`}>Priority</Label>
                    <Input
                      id={`priority-${index}`}
                      type="number"
                      value={rule.priority}
                      onChange={(e) => updateRule(index, 'priority', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteRule(index)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Conditions (JSON)</Label>
              <Textarea
                value={JSON.stringify(rule.conditions, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    updateRule(index, 'conditions', parsed)
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Event (JSON)</Label>
              <Textarea
                value={JSON.stringify(rule.event, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    updateRule(index, 'event', parsed)
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-4 pt-4">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save All Rules'}
        </Button>
      </div>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Rules are evaluated in order of priority (highest first)</p>
          <p>• Conditions use json-rules-engine syntax</p>
          <p>• When conditions match, the event is triggered</p>
          <p>• Common event types: &quot;auto-approve&quot;, &quot;auto-reject&quot;</p>
        </CardContent>
      </Card>
    </div>
  )
}

