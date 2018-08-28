/*==============================================================*/
/* Table: SYS_DICT_ITEM                                         */
/*==============================================================*/
create table SYS_DICT_ITEM
(
   DICT_ID              varchar(32) not null comment '�ֵ���ID',
   DICT_TYPE_ID         varchar(32) not null comment '�ֵ�����ID',
   DICT_NAME            varchar(32) comment '�ֵ�������',
   STATE                varchar(20) comment '״̬',
   SORT_NO              int comment '��ʾ˳��',
   PARENT_DICT_ID       varchar(32) comment '���ֵ���ID',
   SEQ_NO               varchar(128) comment '��ʾ����',
   APP_ID               varchar(32) not null comment 'Ӧ��ID',
   LAST_MODIFY_TIME LONG COMMENT '�����޸�ʱ��',
   IS_DELETE           char(1) default 0 comment '�Ƿ�ɾ��',
   primary key (DICT_ID, DICT_TYPE_ID, APP_ID)
);

/*==============================================================*/
/* Table: SYS_DICT_TYPE                                         */
/*==============================================================*/
create table SYS_DICT_TYPE
(
   DICT_TYPE_ID         varchar(32) not null comment '�ֵ�����ID',
   DICT_TYPE_NAME       varchar(64) comment '�ֵ���������',
   PARENT_ID            varchar(32) comment '���ֵ�����ID',
   DICT_SEQNO           varchar(128) comment '�ֵ����к�',
   APP_ID               varchar(32) not null comment 'Ӧ��ID',
   LAST_MODIFY_TIME LONG COMMENT '�����޸�ʱ��',
   IS_DELETE           char(1) default 0 comment '�Ƿ�ɾ��',
   primary key (DICT_TYPE_ID, APP_ID)
);
