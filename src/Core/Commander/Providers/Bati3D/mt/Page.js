define(function(){
        
   var Page = function () {
        this.valid = false;
        this.priority = 0;
        this.mipLevel = 0;
        this.forced = false;
        this.reserved = 0;
        this.pageId = null;
  };
   
  return Page;  
});