var _ = require('lodash');
var assert = require('assert');

var summaryUtils = require('../lib/summary');

describe('Summary normalization', function () {
    var summary = summaryUtils.normalize([
        {
            title: "Test 1",
            path: "./test1.md"
        },
        {
            title: "Test 2",
            path: "hello\\test2.md",
            articles: [
                {
                    title: "Test 2.1",
                    path: "./test21.md"
                },
                {
                    title: "Test 2.2",
                    path: "./test22.md"
                }
            ]
        },
        {
            title: "Test 3"
        },
        {
            title: "Test 4",
            path: "./test1.md"
        },
    ]);

    it('should normalize paths', function() {
        assert.equal(summary.chapters[1].path, "test1.md");
        assert.equal(summary.chapters[2].path, "hello/test2.md");
        assert.equal(summary.chapters[3].exists, false);
    });

    it('should have unique entry by filename', function() {
        assert.equal(summary.chapters.length, 4);
    });

    it('should normalize levels', function() {
        assert.equal(summary.chapters[1].level, "1");
        assert.equal(summary.chapters[2].level, "2");
        assert.equal(summary.chapters[2].articles[0].level, "2.1");
        assert.equal(summary.chapters[2].articles[1].level, "2.2");
    });

    it('should correctly add an introduction', function() {
        assert.equal(summary.chapters[0].level, "0");
        assert.equal(summary.chapters[0].path, "README.md");
        assert.equal(summary.chapters[0].title, "Introduction");
    });

    it('should correctly use a custom introduction (non-first)', function() {
        var summaryWithIntro = summaryUtils.normalize([
            {
                title: "Test 1",
                path: "./test1.md"
            },
            {
                title: "Test 2",
                path: "./intro.md"
            }
        ], {
            entryPoint: "intro.md",
        });

        assert.equal(summaryWithIntro.chapters[0].path, "test1.md");
        assert.equal(summaryWithIntro.chapters[1].path, "intro.md");
        assert.equal(summaryWithIntro.chapters.length, 2);
    });
});
