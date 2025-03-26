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
      content: `我现在很饿，但是不知道吃什么，请你模仿${name}的语气，结合搞笑的段子，向我推荐菜品，需要包含具体的外面店铺或者菜品名。`
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