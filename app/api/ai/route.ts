import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY?.trim();

        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'API 密钥未配置' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt = `
            你是一个专业的笔记助手。请针对以下笔记内容，生成一个简短的摘要（不超过50个字）和3-5个相关的标签。
            请严格按照 JSON 格式返回，不要包含任何额外的 Markdown 标记或文字。
            
            JSON 结构示例：
            {
              "summary": "这是摘要内容...",
              "tags": ["标签1", "标签2"]
            }

            笔记内容：
            ${content}
        `;

        // 尝试所有可能的模型 ID，根据之前查到的列表
        const modelsToTry = [
            'gemini-flash-latest',
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-pro-latest',
            'gemini-pro',
            'gemini-2.0-flash-lite',
            'gemini-1.5-flash-001'
        ];

        let lastError: any = null;
        let anyQuotaError = false;

        console.log('--- 开始多模型调用测试 ---');
        for (const modelName of modelsToTry) {
            try {
                console.log(`尝试模型: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const aiResult = await model.generateContent(prompt);
                const response = await aiResult.response;
                const text = response.text();

                // 解析 JSON
                try {
                    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    const aiData = JSON.parse(cleanJson);
                    console.log(`✅ 模型 ${modelName} 成功！`);
                    return NextResponse.json(aiData);
                } catch (parseError) {
                    console.warn(`⚠️ 模型 ${modelName} 返回格式非标准 JSON，已进行截断处理`);
                    return NextResponse.json({
                        summary: text.substring(0, 100) + '...',
                        tags: []
                    });
                }
            } catch (error: any) {
                lastError = error;
                const errorMsg = error.message || '';
                console.warn(`❌ 模型 ${modelName} 失败: ${errorMsg.substring(0, 80)}...`);

                if (errorMsg.includes('429')) {
                    anyQuotaError = true;
                    // 如果是 quota limit 0，继续尝试。如果是普通的频率过快，也可以尝试一个备选。
                    continue;
                }

                if (errorMsg.includes('404')) {
                    continue;
                }

                // 其他错误也尝试下一个
                continue;
            }
        }

        console.error('--- 所有模型均调用失败 ---');

        // 所有尝试都失败了
        const isActuallyQuota = anyQuotaError || lastError?.message?.includes('429');
        const finalError = isActuallyQuota ? 'AI 访问频率限制或额度不足，请稍后再试' : 'AI 服务暂不可用 (所有模型均返回错误)';

        return NextResponse.json({
            error: finalError,
            details: lastError?.message || '无法连接到 AI 服务'
        }, { status: isActuallyQuota ? 429 : 500 });

    } catch (error: any) {
        console.error('AI API 严重异常:', error.message);
        return NextResponse.json({
            error: 'AI 处理严重异常',
            details: error.message
        }, { status: 500 });
    }
}
