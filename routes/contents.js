var express = require('express');
var router = express.Router();
var BoardContents = require('../models/boardSchema');
var Category = require('../models/categorySchema');
var To = require('../models/toSchema');


router.get('/', function(req, res) {
    var order = req.query.order;
    var sortCondition;
    var findCondition = { deleted: false};
    var today = Date.now();

    var fromDate = today-30*24*60*60000;
    var toDate = today;

    findCondition.date = {$gte: fromDate, $lte: toDate};

    if(order=='new') {
        sortCondition = {date:-1};
    } else if(order=='best') {
        sortCondition = {ncomments:-1};
    }

    BoardContents.find(findCondition).populate('to').populate('category').sort(sortCondition).exec(function(err, rawContents) {
        if (err) throw err;

        var sorted_best = rawContents.slice();
        bestPetition = sorted_best.sort(function(a, b){
              return a.ncomments>b.ncomments ? -1 : a.ncomments < b.ncomments ? 1 : 0;
            })[0];

        Category.find({}, function(err, Categories) {
            if (err) throw err;

            To.find({}, function(err, Tos) {
                if(err) throw err;

                res.render('board', {title:"Board", contents: rawContents, categories: Categories, tos: Tos, bestPetition: bestPetition, order: order});
            });
        });
    });
});


router.get('/addNew', function(req, res) {
    Category.find({}, function(err, Categories) {
        if(err) throw err;

        To.find({}, function(err, Tos) {
            if (err) throw err;

            res.render('addNew', {categories: Categories, tos: Tos});
        });
    });
});


router.post('/add', function(req, res) {
    var addNewTitle = req.body.addContentSubject;
    var addNewWriter = req.body.addContentWriter;
    var addNewContent = req.body.addContents;
    var addNewPassword = req.body.addContentPassword;
    var addNewTo = req.body.to;
    var addNewCategory = req.body.category;

    console.log(addNewTo);

    addBoard(addNewTitle, addNewWriter, addNewContent, addNewPassword, addNewTo, addNewCategory);
    res.redirect('/boards/?order=new');
});


router.get('/mod', function(req, res) {
    var contentId = req.query.id;

    BoardContents.findOne({_id: contentId}, function(err, modContent) {
        if (err) throw err;

        Category.find({}, function(err, Categories) {
            if (err) throw err;

            To.find({}, function(err, Tos) {
                if(err) throw err;

                res.render('mod', {content: modContent, categories: Categories, tos: Tos});
            });
        });
    });
});


router.post('/modify', function(req, res) {
    var modTitle = req.body.modContentSubject;
    var modContent = req.body.modContents;
    var modId = req.body.modId;
    var modTo = req.body.modTo;
    var modCategory = req.body.modCategory;

    modBoard(modId, modTitle, modContent, modTo, modCategory);
    res.redirect('/boards');
});


router.post('/search', function(req, res) {

    var keyword = req.body.searchText;
    var searchCondition = { $regex: keyword };

    console.log(keyword);
    BoardContents.find({ deleted: false, $or: [{ title: searchCondition }, { writer: searchCondition }, { contents: searchCondition }] }).sort({ date: -1 }).exec(function(err, searchContents) {
        if (err) throw err;

        res.render('search', { contents: searchContents });
    });
});     


router.get('/view', function(req, res) {
    var contentId = req.query.id;
    var search = req.query.search;

    BoardContents.findOne({ _id: contentId }).populate('to').populate('category').exec(function(err, rawContent) {
        if (err) throw err;
        rawContent.count += 1;
        rawContent.save(function(err) {
            if(err) throw err;
        });

        Category.find({}, function(err, Categories) {
            if (err) throw err;

            To.find({}, function(err, Tos) {
                if(err) throw err;

                res.render('boardDetail', {title:"Board", content: rawContent, categories: Categories, tos: Tos, search_flag: search});
            });
        });
    });
});


router.get('/password', function(req, res) {
    var id = req.query.id;

    BoardContents.findOne({ _id: id }, function(err, rawContent) {
        res.send(rawContent.password);
    });
});


router.get('/delete', function(req, res) {
    var id = req.query.id;

    BoardContents.update({ _id: id }, { $set: { deleted: true } }, function(err) {
        if (err) throw err;
    });

    res.redirect('/boards');
});


router.post('/comment', function(req, res) {
    var commentMemo = req.body.commentMemo;
    var commentWriter = "unknown"; //로그인하고 처리
    var contentId = req.body.contentId;

    addComment(contentId, commentWriter, commentMemo);

    res.redirect('/boards/view?id=' + contentId);
});


router.get('/category', function(req, res) {
    var cNum = req.query.c;
    var order = req.query.order;
    var categoryCondition = {deleted: false};
    var viewCondition;
    var cName;

    var today = Date.now();

    var fromDate = today-30*24*60*60000;
    var toDate = today;

    categoryCondition.date = {$gte: fromDate, $lte: toDate};

    if(order=='new') {
        viewCondition = {date:-1};
    } else if(order=='best') {
        viewCondition = {ncomments:-1};
    }

    if(cNum==0) {
        cName="전체";
    } else {
        categoryCondition = {category: cNum};
        Category.findOne({_id:cNum}, function(err, data) {
            if(err) throw err;

            cName = data.name;
        });
    }


    BoardContents.find(categoryCondition).populate('to').populate('category').sort(viewCondition).exec(function(err, rawContents) {
        if(err) throw err;

        Category.find({}, function(err, Categories) {
            if(err) throw err;

            To.find({}, function(err, Tos) {
                if(err) throw err;

                res.render('category', {contents:rawContents, categories:Categories, tos:Tos, cName: cName, cNum: cNum});
            });
        });
    });
});


router.get('/to', function(req, res) {
    var tNum = req.query.t;
    var order = req.query.order;
    var toCondition = {deleted: false};
    var viewCondition;
    var tName;

    var today = Date.now();

    var fromDate = today-30*24*60*60000;
    var toDate = today;

    toCondition.date = {$gte: fromDate, $lte: toDate};

    if(order=='new') {
        viewCondition = {date:-1};
    } else if(order=='best') {
        viewCondition = {ncomments:-1};
    }

    if(tNum==0) {
        tName="전체";
    } else {
        toCondition = {to: tNum};
        To.findOne({_id:tNum}, function(err, data) {
            if(err) throw err;

            tName = data.name;
        });
    }


    BoardContents.find(toCondition).populate('to').populate('category').sort(viewCondition).exec(function(err, rawContents) {
        if(err) throw err;

        Category.find({}, function(err, Categories) {
            if(err) throw err;

            To.find({}, function(err, Tos) {
                if(err) throw err;

                res.render('to', {contents:rawContents, categories:Categories, tos:Tos, tName: tName, tNum: tNum});
            });
        });
    });
});


function addComment(id, writer, memo) {
    BoardContents.findOne({_id:id}, function(err, rawContent) {
        if (err) throw err;

        rawContent.comments.unshift({writer:writer, memo: memo});
        rawContent.ncomments+=1;
        rawContent.save(function(err) {
            if(err) throw err;
        });
    });
}


function addBoard(title, writer, content, password, to, category) {
    var newBoardContents = new BoardContents();

    newBoardContents.writer = writer;
    newBoardContents.title = title;
    newBoardContents.contents = content;
    newBoardContents.password = password;
    newBoardContents.category = category;
    newBoardContents.to = to;

    console.log(newBoardContents.date);
    newBoardContents.save(function(err) {
        if (err) throw err;
    });
}


function modBoard(id, title, content, to, category) {
    var modContent = content.replace(/\r\n/gi, "\r\n");

    BoardContents.findOne({ _id: id }, function(err, originContent) {
        if (err) throw err;
        originContent.updated.push({ title: originContent.title, contents: originContent.contents, to:originContent.to, category: originContent.category });
        originContent.save(function(err) {
            if (err) throw err;
        });
    });

    BoardContents.update({ _id: id }, { title: title, contents: modContent, to: to, category: category }, function(err) {
        if (err) throw err;
    });
}

module.exports = router;
