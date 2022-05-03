import { Injectable } from '@angular/core';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';

export interface ITeamMember {
    photo:string,
    name:string,
    job:string,
    facebook: string,
    twitter: string,
    linkedin: string,
    instagram: string
}

@Injectable({
    providedIn: 'root'
})

export class Aboutpage{
    _id: string = '';
    private_web_address: string;
    title: string = '';
    description: string = '';
    image: string = '';
    image_position: string = 'left';
    team_title: string = '';
    team_description: string = '';
    team_members: ITeamMember[] = [];
    util = UtilFunc;

    constructor(private utilService: UtilService)	{	
		this.init();        
	}

    load(success?:Function, error?:Function) {
        this.utilService.get('sale/aboutpage', {}).subscribe(result => {
            if(result && result.body) {
                const about = result.body;
                this._id = about._id;
                this.private_web_address = about.private_web_address;
                this.title = about.title;
                this.description = about.description;
                this.image = about.image;
                this.image_position = about.image_position;
                this.team_title = about.team_title;
                this.team_description = about.team_description;
                this.team_members = about.team_members;
                if(success) success();
            } else {
                if(error) error();
            }
        }, err => {
            if(error) error();
        })
    }

    init() {
        this._id = '';
        this.private_web_address = this.utilService.getCurrentPrivateWebAddress() || this.util.getPrivateWebAddress();
        this.title = '';
        this.description = '';
        this.image = '';
        this.image_position = 'left';
        this.team_title = '';
        this.team_description = '';
        this.team_members = [];
    }

    public get data():any {
        const data = {
            _id: this._id,
            private_web_address: this.private_web_address,
            title: this.title,
            description: this.description,
            image: this.image,
            image_position: this.image_position,
            team_title: this.team_title,
            team_description: this.team_description,
            team_members: this.team_members
        }
        return data;
    }

    save(callback?:Function, error?:Function) {
        const data = this.data;
        if(data._id) {
            this.utilService.put('sale/aboutpage', data).subscribe(result => {
                if(callback) callback(result);
            }, err => {
                if(error) error();
            })
        } else {
            delete data._id;
            this.utilService.post('sale/aboutpage', data).subscribe(result => {
                this._id = result._id;
                if(callback) callback(result);
            }, err => {
                if(error) error();
            })
        }
    }
}