// Quick test script for question generation
import dotenv from 'dotenv';
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

async function testQuestionGeneration(topic, difficulty) {
    const difficultyGuide = {
        'Easy': 'basic facts, common knowledge, straightforward questions',
        'Medium': 'requires some knowledge, moderate complexity',
        'Hard': 'detailed knowledge, tricky options, expert level'
    };

    const prompt = `You are a quiz master. Generate exactly 5 multiple-choice trivia questions about "${topic}".
Difficulty: ${difficulty} (${difficultyGuide[difficulty] || 'moderate'})

Requirements:
- Each question must be specifically about ${topic}
- Include 4 answer options
- Only ONE correct answer per question
- Make incorrect options plausible but wrong

Respond with ONLY a JSON array in this exact format, no other text:
[
  {
    "question": "Your specific question about ${topic}?",
    "options": ["Correct Answer", "Wrong Option 1", "Wrong Option 2", "Wrong Option 3"],
    "correctAnswerIndex": 0
  }
]

Generate 5 questions now:`;

    console.log(`\n📝 Testing question generation for: "${topic}" (${difficulty})\n`);
    
    try {
        const response = await fetch('https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'mistralai/Mistral-7B-Instruct-v0.3',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2500,
                temperature: 0.8,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const fullResponse = data.choices?.[0]?.message?.content || '';
        
        console.log('📥 Raw Response:\n', fullResponse, '\n');

        // Extract JSON
        const jsonMatch = fullResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            console.log('✅ Parsed Questions:\n');
            questions.forEach((q, i) => {
                console.log(`Q${i + 1}: ${q.question}`);
                q.options.forEach((opt, j) => {
                    const marker = j === q.correctAnswerIndex ? '✓' : ' ';
                    console.log(`  ${marker} ${String.fromCharCode(65 + j)}. ${opt}`);
                });
                console.log();
            });
        } else {
            console.log('❌ Could not parse JSON from response');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test with different topics
const topic = process.argv[2] || 'World War 2';
const difficulty = process.argv[3] || 'Medium';

testQuestionGeneration(topic, difficulty);
