const celebrities = ['蒋敦豪','鹭卓','李耕耘','李昊','赵一博','卓沅','赵小童','何浩楠','陈少熙','王一珩'];

function initCelebrityButtons() {
  const grid = document.querySelector('.celebrity-grid');
  grid.innerHTML = celebrities.map(name => 
    `<button class="celebrity-btn" data-name="${name}">${name}</button>`
  ).join('');

  document.querySelectorAll('.celebrity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const params = new URLSearchParams();
      params.append('name', btn.dataset.name);
      params.append('preference', sessionStorage.getItem('userPreference') || '');
      window.location.href = 'recommendation.html?' + params.toString();
    });
  });
}

async function fetchRecommendation(name, preference) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-34fc6e9144b24a7baa7b6673a3223d9f'
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{
        role: "user",
        content: `你是一个美食推荐官，可以把很简单的家常菜品夸得很有食欲，同时也有能力挖掘奇妙的美食搭配，不仅对国内没事了如指掌，还对国外美食信手拈来。
到了点外卖的时间，但是我实在想不出来要点什么外卖。请你给我随机推荐菜品，不要热门菜品，必须要非常随机，避免每次推荐的菜品是相似的。
${preference}。请你模仿 ${name} 的语气，用搞笑的语气讲一个段子，段子中融合推荐的菜品，适当的加入符合这个人特质的动词，让人物形象更生动活泼。让他向我推荐菜品，菜品需要与段子结合起来，需要包含具体的外卖店铺或者菜品名。
每次输出格式不固定，回答中既要有常见的菜品也要有不常见的菜品，或者各地的特色菜，甚至国外美食。若推荐自己做的简单家常菜，可以用 ${name} 的语气教做菜。推荐语中还应反映出是谁在推荐。`
      }],
      temperature: 1.3,
      stream: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          if (line.includes('[DONE]')) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.choices[0].delta.content) {
              fullContent += json.choices[0].delta.content;
              updateStreamContent(fullContent);
            }
          } catch (e) {
            console.error('解析流数据失败:', e);
          }
        } catch (e) {
          console.error('解析流数据失败:', e);
        }
      }
    }
  }

  return { content: fullContent };
}

function updateStreamContent(text) {
  const streamDiv = document.getElementById('stream-content');
  if (streamDiv) {
    streamDiv.innerHTML = text.replace(/\n/g, '<br>');
    streamDiv.scrollTop = streamDiv.scrollHeight;
  }
}

function showLoading() {
  const currentName = sessionStorage.getItem('currentCelebrity');
  document.body.innerHTML = `
    <div class="loading-overlay">
      <div class="spinner"></div>
      <p>监工正在努力思考...</p>
      <div id="stream-content" style="margin-top:20px; padding:10px; border:1px solid #ccc; border-radius:4px;"></div>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
  <button id="retry-btn" style="padding:8px 16px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">换种推荐</button>
  <button id="reset-btn" style="padding:8px 16px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer;">换个人推荐</button>
</div>
    </div>
  `;

  document.getElementById('reset-btn').addEventListener('click', () => {
  sessionStorage.clear();
  location.href = 'index.html';
});

document.getElementById('retry-btn').addEventListener('click', async () => {
    showLoading();
    try {
      const recommendation = await fetchRecommendation(currentName);
      sessionStorage.setItem('currentRecommendation', JSON.stringify(recommendation));
    } catch (error) {
      console.error('重新推荐失败:', error);
      alert('推荐生成失败，请重试！');
    }
  });
}

document.addEventListener('DOMContentLoaded', initCelebrityButtons);
