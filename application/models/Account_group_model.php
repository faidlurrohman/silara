<?php

class Account_group_model extends CI_Model {

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }

    function get_all()
    {
        $sql = "
            with a as (
                select ag.*,ab.label as account_base_label from silarakab.account_group ag
                join silarakab.account_base ab on ab.id=ag.account_base_id
            ) select a.*,count(*) over() as ttl_count from a
            order by a.id desc
        ";
        $query = $this->db->query($sql);
        return model_response($query);
    }

    function get_list()
    {
        $sql = "
            with a as (
                select ag.*,ab.label as account_base_label from silarakab.account_group ag
                join silarakab.account_base ab on ab.id=ag.account_base_id
            ) select a.*,a.id as value,count(*) over() as ttl_count from a
            where a.active
            order by a.label asc
        ";
        $query = $this->db->query($sql);
        return model_response($query);
    }

    function save($params)
    {
        $id = $params['id'];

        $sql_insert = "
            insert into silarakab.account_group
            (account_base_id,label,remark,active)
            values ('".$params['account_base_id']."','".$params['label']."','".$params['remark']."','".$params['active']."')
        ";

        $sql_update = "
            update silarakab.account_group
            set account_base_id = '".$params['account_base_id']."',
                label = '".$params['label']."',
                remark = '".$params['remark']."',
                active = '".$params['active']."'
            where id = ".$id."
        ";

        $query = $this->db->query($id ? $sql_update : $sql_insert, $params);
        return model_response($query, 3);
    }

    function delete($params)
    {
        $sql = "
            delete from silarakab.account_group
            where id=?
        ";
        $query = $this->db->query($sql, $params);
        return model_response($query, 3);
    }

}
