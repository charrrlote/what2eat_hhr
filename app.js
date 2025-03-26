const celebrities = ['蒋敦豪','鹭卓','李耕耘','李昊','赵一博','卓沅','赵小童','何浩楠','陈少熙','王一珩'];

function initCelebrityButtons() {
  const grid = document.querySelector('.celebrity-grid');
  grid.innerHTML = celebrities.map(name => 
    `<button class="celebrity-btn" data-name="${name}">${name}</button>`
  ).join('');

  document.querySelectorAll('.celebrity-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      showLoading();
      try {
        const recommendation = await fetchRecommendation(btn.dataset.name);
        sessionStorage.setItem('currentRecommendation', JSON.stringify(recommendation));
        window.location.href = 'recommendation.html';
      } catch (error) {
        console.error('API请求失败:', error);
        alert('推荐生成失败，请重试！');
      }
    });
  });
}

async function fetchRecommendation(name) {
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
      content: `我现在很饿，但是不知道吃什么，请你模仿${name}的语气，用搞笑的语气适当的加入符合这个人特质的动词，让人物形象更生动活泼。让他向我推荐菜品，菜品需要与段子结合起来，需要包含具体的外面店铺或者菜品名。每次输出格式不固定，不要出现黄焖鸡、螺蛳粉、兰州拉面，尽可能从推荐不常见的菜品，或者各地的特色菜，甚至国外美食。尽量避免推荐兰州拉面、黄焖鸡和螺蛳粉，多推荐家常菜，若推荐自己做的简单家常菜，可以用${name}的语气教做菜。推荐语中还应反映出是谁在推荐。`
    }],
    temperature: 0.8
  })
  });
  return response.json();
}

function showLoading() {
  document.body.innerHTML = `
    <div class="loading-overlay">
      <div class="spinner"></div>
      <p>监工正在努力生成推荐...</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', initCelebrityButtons);