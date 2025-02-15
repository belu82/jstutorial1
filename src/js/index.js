import Search from './models/Search';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeView from './views/likeView';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

const state = {};
window.state = state; //this state is available in the global window object for testing
const controlSearch = async () => {
    //get query from view
    //const query = searchView.getInput();
    const query = searchView.getInput();
    if(query){

        //new search object and add the state
        state.search = new Search(query);1

        //prepare UI for results
        searchView.clearInput();
        searchView.clearResults(); 
        renderLoader(elements.searchRes);
        
        try{
            //search for recipes
            await state.search.getResults();
    
            //console.log(state.search.result);
            clearLoader();
            searchView.renderResults(state.search.result);
        }catch(err){
            alert("Stng wrong with the search!");
            clearLoader();
            
        }
    }
};

elements.searchForm.addEventListener('click', e => {
    e.preventDefault();
    controlSearch();    
});


elements.searchResPages.addEventListener('click', e =>{
    //https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})

/*RECIPE CONTROLLER*/
/*
const r = new Recipe(46956);
r.getRecipe();
console.log(r);
*/


const controlRecipe = async () => {
    //get the id from url
    const id = window.location.hash.replace('#', '');
    console.log(id);
    
    if(id){
        //prepare  UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        //highlight selected search 
        if(state.search){
            
            searchView.highlightSelected(id);
        } 
        
        //create new recipes
        state.recipe = new Recipe(id);
        
        ///testing
        //window.r = state.recipe
        
        //get recipe data
        try{
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            console.log(state.recipe.ingredients);
            //calc servings and time
            state.recipe.calcTime();
            state.recipe.calServings();
            
            //render recipe
            //console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
            
        }catch(err){
            console.log(err);
            alert("Error processing recipe");
        }
    }
};


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//List controller

const controlList = () => {
    if(!state.list) state.list = new List();
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}
state.likes = new Likes();
//likes controller
const controlLike = ()   =>{
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    //user not yet liked the recipe
    if(!state.likes.isLiked(currentID)){
        //add the like state
        const newLike =state.likes.addLike(
            currentID,
            state.recipe.title, 
            state.recipe.author, 
            state.recipe.img
            );

        //toggle like button
        likeView.toggleLikeBtn(true);
        //add like to UI list
        likeView.renderLike(newLike);
        console.log(state.likes);
    }else {
        //remove  like from the state
        state.likes.deleteLike(currentID);
        //toggle like button
        likeView.toggleLikeBtn(false);

        //remove like from the UI
        likeView.deleteLike(currentID);
        console.log(state.likes);
    }
    likeView.toggleLikeMenu(state.likes.getNumLikes());
}
// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }

});


//delete list items 
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    //delete button
    console.log(e.target);
    if(e.target.matches('.shopping__delete, shopping__delete *')){
        //console.log(e);
        //delete from state
        state.list.deleteItem(id);
        //delete from UI
        listView.deleteItem(id);
    }else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id,val);
    }
});

window.addEventListener('load', () =>{
    state.likes = new Likes();
    state.likes.renderStorage();
    likeView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likeView.renderLike(like));
});
//window.l = new List();


/*testing
window.addEventListener('load', e => {
    e.preventDefault();
    controlSearch();    
});
*/

/*
window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);
const search = new Search('pizza');
console.log(search);
search.getResults();
*/