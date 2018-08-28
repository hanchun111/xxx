/*==============================================================*/
/* Table: SYS_DICT_ITEM                                         */
/*==============================================================*/
create table SYS_DICT_ITEM
(
   DICT_ID              varchar(32) not null comment '字典项ID',
   DICT_TYPE_ID         varchar(32) not null comment '字典类型ID',
   DICT_NAME            varchar(32) comment '字典项名称',
   STATE                varchar(20) comment '状态',
   SORT_NO              int comment '显示顺序',
   PARENT_DICT_ID       varchar(32) comment '父字典项ID',
   SEQ_NO               varchar(128) comment '显示序列',
   APP_ID               varchar(32) not null comment '应用ID',
   LAST_MODIFY_TIME LONG COMMENT '最新修改时间',
   IS_DELETE           char(1) default 0 comment '是否删除',
   primary key (DICT_ID, DICT_TYPE_ID, APP_ID)
);

/*==============================================================*/
/* Table: SYS_DICT_TYPE                                         */
/*==============================================================*/
create table SYS_DICT_TYPE
(
   DICT_TYPE_ID         varchar(32) not null comment '字典类型ID',
   DICT_TYPE_NAME       varchar(64) comment '字典类型名称',
   PARENT_ID            varchar(32) comment '父字典类型ID',
   DICT_SEQNO           varchar(128) comment '字典序列号',
   APP_ID               varchar(32) not null comment '应用ID',
   LAST_MODIFY_TIME LONG COMMENT '最新修改时间',
   IS_DELETE           char(1) default 0 comment '是否删除',
   primary key (DICT_TYPE_ID, APP_ID)
);
