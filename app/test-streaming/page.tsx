'use client'

import { useState } from 'react'
import StreamingResponse from '../../components/StreamingResponse'

export default function TestStreamingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentDemo, setCurrentDemo] = useState<'summarize' | 'draft'>('summarize')
  const [response, setResponse] = useState('')

  const sampleResponses = {
    summarize: `**DAO Proposal Summary: Treasury Diversification Strategy**

**Main Objective**: Diversify the DAO's treasury to reduce risk and increase passive income by reallocating 30% of current ETH holdings into a mix of cryptocurrencies and DeFi opportunities.

**Key Points**:
- **Allocation**: 15% (150 ETH) to Bitcoin (BTC), 10% (100 ETH) to stablecoins (USDC/DAI), and 5% (50 ETH) to DeFi yield farming (Aave, Compound).
- **Goal**: Mitigate volatility risk, generate 4-8% annual yield, and improve resilience across market conditions.
- **Execution**: Managed by a 3-of-5 multisig treasury committee, with a 6-week timeline for voting and implementation.

**Potential Impact**:
- **Pros**: Lower portfolio risk, steady income from DeFi, and better long-term sustainability.
- **Cons**: Possible short-term losses during market dips, gas costs for transactions, and smart contract risks in DeFi.

**Considerations**:
- **Risks**: Smart contract vulnerabilities, execution challenges during asset swaps, and market volatility affecting BTC or stablecoins.
- **Trade-offs**: Balancing yield potential with capital preservation; reduced concentration in ETH but increased complexity in management.

This proposal aims to strengthen the DAO's financial resilience while exploring income-generating opportunities. Members must weigh the benefits of diversification against the risks of added complexity and market exposure.`,
    
    draft: `# DAO Community Grants Program

## Summary
This proposal establishes a comprehensive community grants program to fund innovative projects that align with our DAO's mission and drive ecosystem growth.

## Motivation
Our DAO has accumulated substantial treasury assets, but we lack a structured mechanism to deploy these resources for community benefit. A grants program would:
- Incentivize high-quality contributions to our ecosystem
- Support developers building on our platform
- Foster community engagement and loyalty
- Create measurable value for token holders

## Specification
We propose allocating 100 ETH from the treasury to fund grants across three categories:

### Technical Development Grants (60 ETH)
- Infrastructure improvements and tooling
- Integration with other protocols
- Security audits and bug bounties
- Maximum grant size: 15 ETH per project

### Community Building Grants (25 ETH)
- Educational content creation
- Community events and hackathons
- Translation and localization efforts
- Maximum grant size: 5 ETH per project

### Research Grants (15 ETH)
- Governance mechanism research
- Economic modeling and analysis
- Academic partnerships
- Maximum grant size: 10 ETH per project

## Implementation
1. **Grant Committee**: Establish a 5-member committee elected by token holders
2. **Application Process**: Create standardized application forms and evaluation criteria
3. **Milestone-Based Funding**: Release funds upon completion of predefined milestones
4. **Quarterly Reviews**: Regular assessment of program effectiveness and grant outcomes

## Timeline
- Week 1-2: Community feedback and proposal refinement
- Week 3: Token holder voting
- Week 4-6: Committee formation and process establishment
- Month 2: Launch grant application portal
- Month 3: Begin evaluating first round of applications

## Benefits
- Accelerated ecosystem development
- Increased DAO visibility and reputation
- Enhanced token utility through productive treasury deployment
- Strengthened community bonds through shared success

## Risks and Considerations
- **Grant Quality**: Risk of funding low-impact projects
  - *Mitigation*: Rigorous evaluation process and milestone-based funding
- **Committee Bias**: Potential for favoritism in grant allocation
  - *Mitigation*: Transparent evaluation criteria and regular committee rotation
- **Treasury Depletion**: Risk of over-allocating funds
  - *Mitigation*: Conservative initial allocation with option to expand based on results

## Voting Options
1. **Approve Full Program**: Implement the complete 100 ETH grants program as specified
2. **Approve Reduced Version**: Start with 50 ETH pilot program to test the concept
3. **Reject Proposal**: Maintain current treasury allocation strategy

This grants program represents a strategic investment in our DAO's future, transforming passive treasury holdings into active ecosystem growth drivers.`
  }

  const startDemo = () => {
    setIsLoading(true)
    setResponse('')
    
    // Simulate AI thinking time (3-6 seconds)
    const thinkingTime = 3000 + Math.random() * 3000
    
    setTimeout(() => {
      setIsLoading(false)
      setResponse(sampleResponses[currentDemo])
    }, thinkingTime)
  }

  const resetDemo = () => {
    setIsLoading(false)
    setResponse('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 Streaming AI Response Demo
          </h1>
          <p className="text-gray-600">
            Experience the new ChatGPT-style thinking and streaming responses!
          </p>
        </div>

        {/* Demo Controls */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Demo Controls</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setCurrentDemo('summarize')}
              className={`p-4 rounded-lg font-medium transition-all ${
                currentDemo === 'summarize'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Summarize Demo
            </button>
            <button
              onClick={() => setCurrentDemo('draft')}
              className={`p-4 rounded-lg font-medium transition-all ${
                currentDemo === 'draft'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✍️ Draft Demo
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={startDemo}
              disabled={isLoading}
              className={`btn-primary flex-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? '🤖 AI is thinking...' : '🚀 Start AI Demo'}
            </button>
            <button
              onClick={resetDemo}
              disabled={isLoading}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Streaming Response Demo */}
        <StreamingResponse 
          response={response}
          isLoading={isLoading}
          type={currentDemo}
          onComplete={() => {
            console.log('Streaming complete!')
          }}
        />

        {/* Features Explanation */}
        {!isLoading && !response && (
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">🧠 Thinking Phase</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Collapsible thinking process display</li>
                <li>• Real-time elapsed time counter</li>
                <li>• Context-specific thinking messages</li>
                <li>• Visual indicators for active/complete states</li>
                <li>• Smooth animations and transitions</li>
              </ul>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">⚡ Streaming Response</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Word-by-word text streaming (~20 WPS)</li>
                <li>• Real-time cursor effect during generation</li>
                <li>• Progress indicators and timing</li>
                <li>• Integrated copy and blockchain save options</li>
                <li>• Beautiful formatting and typography</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="btn-primary inline-flex items-center"
          >
            ← Back to DAO Assistant
          </a>
          <div className="mt-4">
            <a 
              href="/test-loading"
              className="btn-secondary inline-flex items-center ml-4"
            >
              🎭 View Loading Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 