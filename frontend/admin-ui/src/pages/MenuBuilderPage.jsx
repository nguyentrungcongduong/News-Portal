import React, { useState, useEffect } from 'react';
import { Tree, Tabs, Button, Space, message, Layout, Card, Checkbox, List, Form, Input, Row, Col, Typography, Modal } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenu, updateMenuItems, getPages, getCategories } from '../services/menuService';

const { Title, Text } = Typography;

export default function MenuBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [pages, setPages] = useState([]); // Resource list
  const [categories, setCategories] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]); // Selected IDs for add
  const [selectedCats, setSelectedCats] = useState([]);
  const [customLink, setCustomLink] = useState({ title: '', url: '' });
  const [loading, setLoading] = useState(false);

  // Load Menu and Resources
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, pagesRes, catsRes] = await Promise.all([
          getMenu(id),
          getPages({ per_page: 100 }), // Get all pages
          getCategories()
        ]);
        
        setMenu(menuRes.data);
        setPages(pagesRes.data.data || []);
        setCategories(catsRes.data);
        
        // Build initial tree
        if (menuRes.data.items) {
          setTreeData(buildTreeFromFlat(menuRes.data.items));
        }
      } catch (error) {
        message.error('Lỗi tải dữ liệu');
      }
    };
    fetchData();
  }, [id]);

  // --- HELPER: Build Tree from Flat DB Items ---
  const buildTreeFromFlat = (items) => {
    // Sort by order first
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const map = {};
    const roots = [];
    
    // Create map
    sorted.forEach(item => {
      map[item.id] = { 
        key: String(item.id), 
        title: item.title, 
        children: [],
        ...item // Keep original data
      };
    });
    
    // Connect parents
    sorted.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });
    
    return roots;
  };

  // --- HELPER: Map Tree for API (Nested) ---
  const mapTreeForApi = (nodes) => {
    return nodes.map(node => {
      // Check if key is temporary (starts with 'new_') -> id is null
      const isNew = String(node.key).startsWith('new_');
      
      return {
        id: isNew ? null : node.id,
        title: node.title,
        type: node.type,
        url: node.url,
        reference_id: node.reference_id || node.linkable_id, // Normalize
        status: node.status !== undefined ? node.status : true,
        children: node.children && node.children.length > 0 ? mapTreeForApi(node.children) : []
      };
    });
  };

  // ANT DESIGN TREE DRAG LOGIC (Standard)
  const onDrop = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children, key, callback);
        }
      }
    };

    const data = [...treeData];

    // Find drag object
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on other node (Nest)
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.push(dragObj);
      });
    } else if (
      (info.node.children || []).length > 0 && // Has children
      info.node.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }
    setTreeData(data);
  };

  // --- ACTIONS ---
  const addPagesToMenu = () => {
    const newItems = selectedPages.map(pageId => {
        const page = pages.find(p => p.id === pageId);
        return {
            key: `new_page_${Date.now()}_${pageId}`,
            title: page.title,
            type: 'page',
            reference_id: page.id,
            children: []
        };
    });
    setTreeData([...treeData, ...newItems]);
    setSelectedPages([]);
    message.success(`Đã thêm ${newItems.length} trang`);
  };

  const addCatsToMenu = () => {
    const newItems = selectedCats.map(catId => {
        const cat = categories.find(c => c.id === catId);
        return {
            key: `new_cat_${Date.now()}_${catId}`,
            title: cat.name,
            type: 'category',
            reference_id: cat.id,
            children: []
        };
    });
    setTreeData([...treeData, ...newItems]);
    setSelectedCats([]);
    message.success(`Đã thêm ${newItems.length} danh mục`);
  };

  const addCustomLink = () => {
      if (!customLink.title || !customLink.url) return;
      const newItem = {
          key: `new_custom_${Date.now()}`,
          title: customLink.title,
          type: 'custom',
          url: customLink.url,
          children: []
      };
      setTreeData([...treeData, newItem]);
      setCustomLink({ title: '', url: '' });
  };

  const handleSave = async () => {
      setLoading(true);
      
      const nestedItems = mapTreeForApi(treeData);
      
      try {
          await updateMenuItems(id, nestedItems);
          message.success('Đã lưu cấu trúc menu!');
          // Reload to get real IDs
          const res = await getMenu(id);
          if (res.data.items) {
             setTreeData(buildTreeFromFlat(res.data.items));
          }
      } catch (error) {
          message.error('Lỗi khi lưu menu');
      } finally {
          setLoading(false);
      }
  };

  const [itemEditModalOpen, setItemEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [itemForm] = Form.useForm();

  const handleEditNode = (node) => {
    setEditingNode(node);
    itemForm.setFieldsValue({
      title: node.title,
      url: node.url,
    });
    setItemEditModalOpen(true);
  };

  const updateNodeData = (values) => {
    const updateLoop = (data) => {
      return data.map(item => {
        if (item.key === editingNode.key) {
          return { ...item, title: values.title, url: values.url };
        }
        if (item.children) {
          return { ...item, children: updateLoop(item.children) };
        }
        return item;
      });
    };
    setTreeData(updateLoop(treeData));
    setItemEditModalOpen(false);
    setEditingNode(null);
  };

  const removeNode = (key) => {
      // Recursive delete from treeData
      const deleteLoop = (data) => {
          return data.filter(item => {
              if (item.key === key) return false;
              if (item.children) item.children = deleteLoop(item.children);
              return true;
          });
      };
      setTreeData(deleteLoop(treeData));
  };
  
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>Menu: {menu?.name}</Title>
            <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/menus')}>Quay lại</Button>
                <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>Lưu Menu</Button>
            </Space>
        </div>

        <Row gutter={24}>
            {/* LEFT SIDE: SOURCE */}
            <Col span={8}>
                <Card title="Thêm vào Menu" styles={{ body: { padding: 0 } }}>
                    <Tabs 
                        defaultActiveKey="1" 
                        tabPlacement="left" 
                        style={{ minHeight: 400 }}
                        items={[
                            {
                                key: '1',
                                label: 'Pages',
                                children: (
                                    <div style={{ padding: 16, height: 400, overflowY: 'auto' }}>
                                        <Checkbox.Group 
                                            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                                            value={selectedPages}
                                            onChange={setSelectedPages}
                                        >
                                            {pages.map(p => (
                                                <Checkbox key={p.id} value={p.id}>{p.title}</Checkbox>
                                            ))}
                                        </Checkbox.Group>
                                        <Button type="primary" style={{ marginTop: 16 }} onClick={addPagesToMenu} disabled={selectedPages.length === 0}>
                                            Thêm vào Menu
                                        </Button>
                                    </div>
                                )
                            },
                            {
                                key: '2',
                                label: 'Categories',
                                children: (
                                    <div style={{ padding: 16 }}>
                                        <Checkbox.Group 
                                            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                                            value={selectedCats}
                                            onChange={setSelectedCats}
                                        >
                                            {categories.map(c => (
                                                <Checkbox key={c.id} value={c.id}>{c.name}</Checkbox>
                                            ))}
                                        </Checkbox.Group>
                                        <Button type="primary" style={{ marginTop: 16 }} onClick={addCatsToMenu} disabled={selectedCats.length === 0}>
                                            Thêm vào Menu
                                        </Button>
                                    </div>
                                )
                            },
                            {
                                key: '3',
                                label: 'Custom Link',
                                children: (
                                    <div style={{ padding: 16 }}>
                                        <Form layout="vertical">
                                            <Form.Item label="URL">
                                                <Input placeholder="http://" value={customLink.url} onChange={e => setCustomLink({...customLink, url: e.target.value})} />
                                            </Form.Item>
                                            <Form.Item label="Tên hiển thị">
                                                <Input placeholder="Menu Item" value={customLink.title} onChange={e => setCustomLink({...customLink, title: e.target.value})} />
                                            </Form.Item>
                                            <Button type="primary" onClick={addCustomLink} disabled={!customLink.url || !customLink.title}>
                                                Thêm vào Menu
                                            </Button>
                                        </Form>
                                    </div>
                                )
                            }
                        ]}
                    />
                </Card>
            </Col>

            {/* RIGHT SIDE: TREE */}
            <Col span={16}>
                <Card title="Cấu trúc Menu (Kéo thả để sắp xếp)">
                    {treeData.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Chưa có mục nào. Hãy thêm từ bên trái.</div>
                    ) : (
                        <Tree
                            className="draggable-tree"
                            draggable
                            blockNode
                            onDrop={onDrop}
                            treeData={treeData}
                            titleRender={(node) => (
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <span>
                                        <strong>{node.title}</strong> <span style={{ color: '#999', fontSize: 12 }}>({node.type})</span>
                                    </span>
                                    <Space>
                                        <Button size="small" type="text" icon={<EditOutlined />} onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditNode(node);
                                        }} />
                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => {
                                            e.stopPropagation();
                                            removeNode(node.key);
                                        }} />
                                    </Space>
                                </div>
                            )}
                        />
                    )}
                </Card>
            </Col>
        </Row>

        <Modal
          title="Sửa mục menu"
          open={itemEditModalOpen}
          onCancel={() => setItemEditModalOpen(false)}
          onOk={() => itemForm.submit()}
          destroyOnHidden
        >
          <Form form={itemForm} layout="vertical" onFinish={updateNodeData}>
            <Form.Item name="title" label="Tên hiển thị" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            {editingNode?.type === 'custom' && (
              <Form.Item name="url" label="Đường dẫn (URL)" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            )}
            {editingNode?.type !== 'custom' && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Tự động liên kết tới: {editingNode?.type}</Text>
              </div>
            )}
          </Form>
        </Modal>
    </Layout>
  );
}
