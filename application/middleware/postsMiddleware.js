const postsMiddleware = {};

var db = require('../database/database');

var bodyParser = require('body-parser');

const {search} = require('../models/posts-model');


const doTheSearch = async function(req,res, next) {

    try{
        

        let searchTerm = req.body.searchText;
        let categorySearch = req.body.selectedCat;
     

        console.log("search:"+searchTerm);
        console.log("cat: "+categorySearch);
        // let searchTerm = req.query.search;
        // listTerms = searchTerm.split('-');
        // searchTerm = listTerms[0];
        // let categorySearch = listTerms[1];
        
        if(categorySearch==='All'){
           categorySearch = "%";
        }

        console.log("INSIDE DO_RESEARCH");
     
        if(searchTerm===''){ // empty input
   
           // when input is empty show all content within the category 
           let results = await search(searchTerm, categorySearch);
                if (results.length) {
                    // res.send({
                    //     message: `No input was given for your search, but here are ${results.length} posts that may interest you`,
                    //     results: results
                    //    });
                    if(categorySearch==='%'){
                        categorySearch='All';
                        }
                    res.locals.results = results;
                    res.locals.message = `No input was given for your search, but here are ${results.length} posts that may interest you`;
                    res.locals.condition = `${categorySearch} > ${searchTerm}`;

                       next();
                   }else{// nothing within the category so let's show all the posts
                       let [results,fields] = await db.query('SELECT post_id, price, title, post_description, post_creation_time, post_thumbnail FROM posts, categories WHERE post_category=categories.category_id AND categories.category_name LIKE "%" ORDER BY post_creation_time DESC');
                       res.send({
                           message: `No result whithin the selected category, but here are ${results.length} posts that may interest you`,
                           results: results
                          });
                          next();
                    }
                   
        }else { // input text is not empty so show result of the query
            let results = await search(searchTerm, categorySearch);
                if (results.length) {
                    // res.send({
                    //     message: `${results.length} results found`,
                    //     results: results
                    // });
                    if(categorySearch==='%'){
                        categorySearch='All';
                        }

                    res.locals.results = results;
                    res.locals.message = `${results.length} results found`;
                    res.locals.condition = `${categorySearch} > ${searchTerm}`;
                    next();
                } else { // nothing found therefore let's show all the posts within the selected category
                    let [results,fields] = await db.query('SELECT post_id, price, title, post_description, post_creation_time, post_thumbnail FROM posts, categories WHERE post_category=categories.category_id AND categories.category_name LIKE ? ORDER BY post_creation_time DESC', [categorySearch]);
                               if(results.length){
   
                                    if(categorySearch==='%'){
                                    categorySearch='All';
                                    }
                                    
                                    // res.send({
                                    // results: results,
                                    
                                    // message: `No results were found for ${searchTerm} but here are ${results.length} posts within ${categorySearch}`
                                    // }); 

                                    res.locals.results = results;
                                    if(categorySearch==='All'){
                                        res.locals.message = `No results were found for ${searchTerm} but here are ${results.length} posts within all categories`;
                                        }else{
                                            res.locals.message = `No results were found for ${searchTerm} but here are ${results.length} posts within ${categorySearch}`;
                                        }
                                    
                                    res.locals.condition = `${categorySearch} > ${searchTerm}`;
                                    next();
                        
                                }
                            else{// nothing within the category so let's show all the posts
                               let [results,fields] = await db.query('SELECT post_id, price, title, post_description, post_creation_time, post_thumbnail FROM posts, categories WHERE post_category=categories.category_id AND categories.category_name LIKE "%" ORDER BY post_creation_time DESC');
                               
                               
                            //    res.send({
                            //        message: `No result whithin the selected category, but here are ${results.length} posts that may interest you`,
                            //        results: results
                            //       });
                            if(categorySearch==='%'){
                                categorySearch='All';
                                }
                                res.locals.results = results;
                                res.locals.message = `No result whithin the selected category, but here are ${results.length} posts that may interest you`;
                                res.locals.condition = `${categorySearch} > ${searchTerm}`;
                                next();
                            };
                        }
                }
            } catch(err){
           next(err);
           }
}





module.exports = {doTheSearch};