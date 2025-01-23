export default function Link(len:number):String{
  let options = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^*()'
  let link = '';

  for( let i = 0 ; i < len ; i++){
    let index = Math.floor( Math.random()*options.length);
    link += options[index];
  }

  return link;
}