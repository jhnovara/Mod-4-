const postListEl = document.querySelector(`.post-list`);
const city = localStorage.getItem("city") || "Portland";

renderPosts(city);


async function onSearchChange(event) {
    const id = event.target.value;
    renderPosts(id)
    }

async function renderPosts(id) {
    const cityParam = encodeURIComponent(id || city);
    const posts = await fetch(`https://api.openbrewerydb.org/v1/breweries?by_city=Portland&by_state=Oregon&per_page=100`);
    const postsData = await posts.json();
    const filtered = postsData.filter((p) => (p.state || '').toLowerCase() === 'oregon');
    postListEl.innerHTML = filtered.map((post) => postHTML(post)).join("");
}


function postHTML(post) {
    return `
    <div class="post">
        <div class="post__title">
            ${post.name}
        </div>
        <p class="post__body">
            <b>Type:</b> ${post.brewery_type}
        </p>
    </div>
    `;   
}
