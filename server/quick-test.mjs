import dotenv from 'dotenv';
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

async function test(topic, difficulty) {
    const prompt = `Generate 5 quiz questions about "${topic}" at ${difficulty} difficulty.
Return ONLY a JSON array:
[{"question": "Q?", "options": ["A","B","C","D"], "correctAnswerIndex": 0}]`;

    console.log(`\n📝 Generating questions for: "${topic}" (${difficulty})\n`);

    const response = await fetch('https://router.huggingface.co/novita/v3/openai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct',
            messages: [
                { role: 'system', content: 'Output ONLY valid JSON arrays.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
        })
    });

    const data = await response.json();
    console.log('Raw response:', data.choices[0].message.content);
    
    const content = data.choices[0].message.content;
    const match = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    if (match) {
        const questions = JSON.parse(match[0]);
        console.log('\n✅ Parsed Questions:\n');
        questions.forEach((q, i) => {
            console.log(`Q${i+1}: ${q.question}`);
            q.options.forEach((opt, j) => {
                console.log(`  ${j === q.correctAnswerIndex ? '✓' : ' '} ${String.fromCharCode(65+j)}. ${opt}`);
            });
            console.log();
        });
    }
}

test(process.argv[2] || 'World War 2', process.argv[3] || 'Medium');
