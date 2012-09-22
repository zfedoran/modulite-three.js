ml.module('c')
.requires(
  'b.a',
  'b.b')
.defines(function(){
  console.log('module "c" content');
});
