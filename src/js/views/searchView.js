import { elements } from './base';

//clear the search input
export const clearInput = () => {
    elements.searchInput.value = "";
};

//clear the search results
export const clearResults = () =>{
    elements.searchList.innerHTML = "";
    elements.searchResPages.innerHTML = "";
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => el.classList.remove('results__link--active'));

    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};


//cut the title from the results
export const limitRecipeTitle = (title, limit = 17) =>{
    const newTitle = []; 
    if(title.length > limit){
        title.split(' ').reduce((acc, cur) =>{
            if(acc + cur.length <= limit){
                newTitle.push(cur);
            }
            return acc + cur.length;
        },0);
        return `${newTitle.join(' ')} ...`;
    }
    return title;
};

export const getInput = () => elements.searchInput.value;

const renderRecipe = recipe => {
    const markup = `
    <li>
    <a class="results__link" href="#${recipe.recipe_id}">
        <figure class="results__fig">
            <img src="${recipe.image_url}" alt="${recipe.title}">
        </figure>
        <div class="results__data">
            <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
            <p class="results__author">${recipe.publisher}</p>
        </div>
    </a>
</li>
    `;
    //https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
    elements.searchList.insertAdjacentHTML('beforeend', markup);
};

/* without paginations
export const renderResults = recipes => {
    recipes.forEach(renderRecipe);
};
*/

//meghatározzuk, hogy hány db-ból álljon a lista maximum
export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //render results the current page
    const start = (page -1) * resPerPage;
    const end = page * resPerPage;

    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice 
    recipes.slice(start, end).forEach(renderRecipe);

    //render pagination buttons
    renderButtons(page, recipes.length, resPerPage);
};

//hány db gomb legyen a tartalomtól függően

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page -1 : page + 1}>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-$${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
        <span>Page ${type === 'prev' ? page -1 : page + 1}</span>
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults/resPerPage);
    
    //ES6-ban a const nem műküdne, ha az if-ben belül lenne, mert csak abban a scopban él. 
    let button;
    if(page === 1 && pages > 1){
        button = createButton(page, 'next');

    }else if(page < pages){
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;

    }else if(page === pages && pages > 1){
        button = createButton(page, 'prev');

    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button); 
}; 