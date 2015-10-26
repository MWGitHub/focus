import Validation from '../src/utils/Validation';
import {assert} from 'chai';

describe('validation', function() {
    it('should return null for valid usernames', function() {
        assert.notOk(Validation.username('asdf'));
        assert.notOk(Validation.username('asd_123f'));
        assert.notOk(Validation.username('12Adjik235OIJAwer'));
    });

    it('should return an error message for invalid usernames', function() {
        assert.ok(Validation.username());
        assert.ok(Validation.username(''));
        assert.ok(Validation.username('as'));
        assert.ok(Validation.username('as!df'));
        assert.ok(Validation.username('as-d_123f'));
        assert.ok(Validation.username('12Adjik235OIJAwer^'));
        assert.ok(Validation.username('asaiuwheriuahwerhawiuerhiuawheuirhauiwehruiahwieurhiuawheriuhwaiuerhiuwaheiru'));
    });

    it('should return null for valid passwords', function() {
        assert.notOk(Validation.password('%#&*!%'));
        assert.notOk(Validation.password('asd_123f'));
        assert.notOk(Validation.password('12Adjik235OIJAwer'));
    });

    it('should return an error message for invalid passwords', function() {
        assert.ok(Validation.password('asdfg'));
        assert.ok(Validation.password(''));
        assert.ok(Validation.password('a'));
        assert.ok(Validation.password());
    });

    it('should return null for valid tasks', function() {
        assert.notOk(Validation.task('a'));
        assert.notOk(Validation.task('asdf'));
        assert.notOk(Validation.task('asd_1#<p>a</p>^#  6#90'));
        assert.notOk(Validation.task('12Adj\<HTML\>i5OIJAwer'));
    });

    it('should return an error message for invalid tasks', function() {
        assert.ok(Validation.task());
        assert.ok(Validation.task(''));
        assert.ok(Validation.task('asaiuwheriuahwerhawiuerhiuawheuirhauiwehruiahwieurhiuawheriuhwaiuerhiuwaheiru'));
    });
});
