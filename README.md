angular-draganddrop
===================

AngularJS drag&amp;drop module. The dragged element is rendered with a dedicated AngularJS controller. This controller and the associated view is fully customizable.

This modules contains 
- 2 directives: `drag` and `drop`
- 1 service: `dragAndDrop`
- 2 controllers: `DragAndDropController` and `DragAndDropItemController`


[You could find here a sample](http://plnkr.co/edit/o2YCbCDS6ZXfykSGAkL4?p=preview)

## Directives

### `drag` directive

#### Usage

`drag` enable drag support on an element

`drop-callback` callback called after drop occurs. Especialy uselfull to do post drop action (eg. delete dragged element). Evaluated as an expression. If the expression evalutes as a function, it will be called with `dragData` as argument

`drag-include` template included for rendering the dragged element. Evaluated as an expression.

`drag-data` data transfered from drag element to drop element. This module does not clone the data. It is the reponsability of user to clone data. Evaluated as an expression.


#### Sample
```html
<li ng-repeat="book in books" drag drop-callback="endDrag($index)" drag-include="'dragItemTemplate'" drag-data="book">
</li>
```

Example of drag item include:

```html
<script type="text/ng-template" id="dragItemTemplate">
    <div style="box-shadow: 5px 5px 10px 0px #656565; ">
        <img src="{{data.url}}"/>
        <div style="position: absolute;top:0px;left: 0px;background: rgba(255,255,255,0.8);width: 100%">
            {{data.title}}
        </div>
    </div>
</script>
```


### `drop` directive

#### Usage

`drop` enable drop support on an element

`drop-callback` callback called then drop occurs. Evaluated as an expression. If the expression evalutes as a function, it will be called with `dragData` as argument

#### Sample

```html
<section drop drop-callback="endDrop">
</section>
```


## `dragAndDrop` Service

This service stores transfered data. 
Why a `map`? I have planned to add support for multi touch.


## Controllers

### Usage

Controllers handles dragged item rendering. 
Why a `ngRepeat`  I have planned to add support for multi touch.

Controllers must be added just before the end `</body>` element

### Sample

```html
<div ng-controller="DragAndDropController">
    <div ng-repeat='(key, value) in items' ng-controller="DragAndDropItemController" ng-init="init(value.data)"
         class="dragdrop-item-controller">
        <div style="width: 100%" ng-include src="value.include">
        </div>
    </div>
</div>
```





