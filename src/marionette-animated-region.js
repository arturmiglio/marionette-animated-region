((root, factory) => {
  if (typeof exports !== 'undefined') {
    // Define as CommonJS export:
    module.exports = factory(
      require('jquery'),
      require('backbone'),
      require('marionette'),
      require('velocity')
    );
  }
  else if (typeof define === 'function' && define.amd) {
    // Define as AMD:
    define([
      'jquery',
      'backbone',
      'marionette',
      'velocity'
    ], factory);
  }
  else {
    // Browser:
    factory(
      root.$,
      root.Backbone,
      root.Marionette
    );
  }
})(this, ($, Backbone, Marionette) => {

  function iterateOverAnimations(animations, callback) {
    for (let i = 0, length = animations.length - 1; i <= length; i++) {
      const animation = animations[i];

      $.Velocity.animate(
        this.$el,
        animation.properties,
        animation.options
      ).then(() => {
        if (i === length) callback();
      });
    }
  }

  function emptyRegion(view, options) {
    const emptyOptions = options || {};
    const preventDestroy = !!emptyOptions.preventDestroy;

    view.off('destroy', this.empty, this);
    this.triggerMethod('before:empty', view);

    if (!preventDestroy) this._destroyView();

    this.triggerMethod('empty', view);
    delete this.currentView;

    if (preventDestroy) this.$el.contents().detach();
  }

  class AnimatedRegion extends Marionette.Region {
    initialize(options) {
      this.animation = options.animation;
    }

    attachHtml(view) {
      this.$el
        .css({ display: 'none' })
        .html(view.el)
        .velocity('stop');

      if (this.animation && this.animation.showAnimation) {
        iterateOverAnimations.call(this, this.animation.showAnimation, () => {
          AnimatedRegion.trigger('region:shown', this);
        });
      }
      else {
        this.$el.css({ display: 'block' });
      }
    }

    empty(options) {
      const view = this.currentView;

      if (!view) return;

      this.$el.velocity('stop');

      if (this.animation && this.animation.hideAnimation) {
        iterateOverAnimations.call(this, this.animation.hideAnimation, () => {
          emptyRegion.call(this, view, options);
          this.$el.removeAttr('style');
          AnimatedRegion.trigger('region:removed', this);
        });
      }
      else {
        emptyRegion.call(this, view, options);
      }

      return this;
    }
  }

  Object.assign(AnimatedRegion, Backbone.Events);

  return AnimatedRegion;
});
