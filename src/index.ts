import CommonsUniversity from './lib/commons.lib';
import { SsuDefaultURL } from './types/ssu.type';

(async () => {
  
  try{
    const myUniversity = new CommonsUniversity('cookie' , SsuDefaultURL);
    const myClassList = await myUniversity.myClassList(10101);

    for(let i in myClassList ) {
      const {apiRes , apiTitle} = await myUniversity.myClassView(myClassList[i]);
      await myUniversity.Download(apiRes , apiTitle);
    }
    
  }catch(e){
    console.log(e);
  }
  
})();
