define(function(){
    var PageID = {

                create: function (page, mipLevel) {
                    //Using max miplevel:16 , 2^20 for page 
                    return ((page & 0xFFFFFF) << 4) | (mipLevel & 0xF); //x * 2^y
                },

                getMipMapLevel: function (id) {
                    //console.log('getMimapLevel:',id & 0xF);
                    return id & 0xF;
                },

                getPageNumber: function (id) {
                    //console.log('getMimapLevel:',id >> 4); 
                    return id >> 4;
                },

                isValid: function (page) {
                    return page >= 0;
                },

                createInvalid: function () {
                    return -1;
                }
    };
    
    return PageID;
    
});



