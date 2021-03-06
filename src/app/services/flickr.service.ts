import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {FlickrPhoto} from './flickrphoto.model';
import 'rxjs/Rx';

@Injectable()
export class FlickrService {    
    flickrPhotos: Array<FlickrPhoto>;
    flickrApiKey : string = '158f9fda1dd419dc28f2855346f605a3';
    maxPhotos : number = 30;   //amount of photos to display on the webpage

    constructor(private http: Http) { };        
    
    getFlickrResult(query: string) {
        let url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + this.flickrApiKey + '&tags=' + query +'&format=json&nojsoncallback=1';
        console.log(url);        
       
        this.flickrPhotos = []; //removes all photos in the array
        
        return this.getPhotos(url);
    }
    
    getFlickrFilterResult(query: string, color:string) {
        
        // maps colors to colorcode used in api call
        var colorMap =
        {
          'red':'0',
          'orange':'2',
          'yellow':'4',
          'green':'5',
          'blue':'8',
          'purple':'9',
          'black':'e',
          'white':'c'
        }

        let url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + this.flickrApiKey + '&text=' + query +'&tags=' + color + '&color_codes='+colorMap[color]+'&format=json&nojsoncallback=1';
        console.log(url);
        
        this.flickrPhotos = []; //removes all photos in the array
        
        return this.getPhotos(url);
    }
    
    
    getRecent() {
        let url= 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=' + this.flickrApiKey + '&format=json&nojsoncallback=1';
        console.log(url);

        this.flickrPhotos = []; //removes all photos in the array
                
        return this.getPhotos(url);
    }
    
    getPhotos(url : string) {
                this.http.get(url)
                .retry(4)
                .map(res => res.json())
                .subscribe( data => {
                    if(data.photos.total <= 0)
                    {
                        return this.flickrPhotos;
                    }
                    
                    for(var i in data.photos.photo)
                    {
                      if (parseInt(i) > (this.maxPhotos - 1))  //-1 to account for i starting at 0
                      {
                        break;
                      }
                      var flickrPhoto = data.photos.photo[i];

                      //adds new photo object to photos array
                      this.flickrPhotos.push(new FlickrPhoto(flickrPhoto.id, flickrPhoto.server, flickrPhoto.farm, flickrPhoto.secret, flickrPhoto.title, flickrPhoto.owner));
                    }

                },
                err => {console.log (err)}
                );

        return this.flickrPhotos;
    }
    
    
}